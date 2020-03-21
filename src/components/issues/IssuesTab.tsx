import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import React from 'react';
import styles from './IssuesTab.module.scss';
import i18n from 'config/i18n';
import { FlowIssue, Action } from 'flowTypes';
import { PopTab } from 'components/poptab/PopTab';
import { renderIssue } from 'components/flow/actions/helpers';
import {
  AssetMap,
  RenderNode,
  Asset,
  RenderNodeMap,
  RenderAction,
  FlowIssueMap
} from 'store/flowContext';
import { getTypeConfig } from 'config';
import { getType } from 'config/typeConfigs';
import { Type, PopTabType } from 'config/interfaces';

const cx: any = classNames.bind(styles);

export interface IssuesTabProps {
  issues: FlowIssueMap;
  languages: AssetMap;
  nodes: RenderNodeMap;
  onToggled: (visible: boolean, tab: PopTabType) => void;
  onIssueClicked: (issueDetail: IssueDetail) => void;
  onIssueOpened: (IssueDetail: IssueDetail) => void;
  popped: string;
}

export type IssueDetail = {
  issues: FlowIssue[];
  renderObjects: RenderObjects;
  language: Asset;
};

type IssueMap = {
  [uuid: string]: IssueDetail;
};

export interface IssuesTabState {
  visible: boolean;
  selectedIssue: FlowIssue;
  issueDetails: IssueDetail[];
}

export interface RenderObjects {
  renderNode: RenderNode;
  renderAction?: RenderAction;
}

const getIssueKey = (issue: FlowIssue) => {
  return (issue.action_uuid || issue.node_uuid) + (issue.language || '');
};

const getRenderObjects = (issue: FlowIssue, nodes: RenderNodeMap): RenderObjects => {
  const renderNode = nodes[issue.node_uuid];
  let renderAction: RenderAction = null;

  if (issue.action_uuid && renderNode) {
    const actionIdx = issue.action_uuid
      ? renderNode.node.actions.findIndex((action: Action) => action.uuid === issue.action_uuid)
      : null;

    if (actionIdx > -1) {
      const action = renderNode.node.actions[actionIdx];
      renderAction = {
        action,
        config: getTypeConfig(action.type),
        index: actionIdx
      };
    }
  }

  return {
    renderNode,
    renderAction
  };
};

export class IssuesTab extends React.Component<IssuesTabProps, IssuesTabState> {
  constructor(props: IssuesTabProps) {
    super(props);

    this.state = {
      visible: false,
      selectedIssue: null,
      issueDetails: this.buildIssueDetails()
    };

    bindCallbacks(this, {
      include: [/^handle/, /^render/]
    });
  }

  public componentDidUpdate(prevProps: IssuesTabProps): void {
    if (
      this.props.issues !== prevProps.issues ||
      prevProps.nodes !== this.props.nodes ||
      this.props.languages !== prevProps.languages
    ) {
      this.setState({ issueDetails: this.buildIssueDetails() });
    }
  }

  private buildIssueDetails(): IssueDetail[] {
    const issueMap: IssueMap = {};
    if (Object.keys(this.props.nodes).length > 0) {
      for (const issues of Object.values(this.props.issues)) {
        for (const issue of issues) {
          const key = getIssueKey(issue);
          let issueDetail = issueMap[key];
          if (!issueDetail) {
            let language = null;
            if (issue.language && this.props.languages) {
              language = this.props.languages[issue.language];
            }

            const renderObjects = getRenderObjects(issue, this.props.nodes);
            if (renderObjects.renderNode && (!issue.action_uuid || renderObjects.renderAction)) {
              issueDetail = {
                issues: [issue],
                renderObjects: renderObjects,
                language
              };
            }
          } else {
            issueDetail.issues.push(issue);
          }

          if (issueDetail) {
            issueMap[key] = issueDetail;
          }
        }
      }
    }

    return Object.values(issueMap).sort((a: IssueDetail, b: IssueDetail) => {
      if (a.language && !b.language) {
        return 1;
      }

      if (!a.language && b.language) {
        return -1;
      }

      if (a.language && b.language && a.language.name !== b.language.name) {
        return a.language.name.localeCompare(b.language.name);
      }

      const nodeDifference =
        a.renderObjects.renderNode.ui.position.top - b.renderObjects.renderNode.ui.position.top;

      if (nodeDifference !== 0) {
        return nodeDifference;
      }

      // if we are the same node and have actions sort by those
      if (a.renderObjects.renderNode.node.uuid === b.renderObjects.renderNode.node.uuid) {
        if (a.renderObjects.renderAction && b.renderObjects.renderAction) {
          return a.renderObjects.renderAction.index - b.renderObjects.renderAction.index;
        }
      }
      return 0;
    });
  }

  public handleTabClicked(): void {
    this.props.onToggled(!this.state.visible, PopTabType.ISSUES_TAB);

    this.setState((prevState: IssuesTabState) => {
      return { visible: !prevState.visible };
    });
  }

  private handleIssueClicked(issueDetail: IssueDetail) {
    this.props.onIssueClicked(issueDetail);

    window.setTimeout(() => {
      this.props.onIssueOpened(issueDetail);
    }, 750);
  }

  public render(): JSX.Element {
    let issueCount = 0;

    let lastLanguage: Asset = null;

    const issues = this.state.issueDetails.map((details: IssueDetail) => {
      issueCount += details.issues.length;

      let languageHeader: JSX.Element = null;

      if (details.language && details.language !== lastLanguage) {
        languageHeader = <div className={styles.language}>{details.language.name}</div>;
      }

      lastLanguage = details.language;

      let typeConfig: Type = null;

      if (!details.renderObjects.renderNode) {
        return null;
      }

      if (details.renderObjects.renderAction) {
        typeConfig = details.renderObjects.renderAction.config;
      } else {
        typeConfig = getTypeConfig(getType(details.renderObjects.renderNode));
      }

      const locationHeader: JSX.Element = null;
      const issues = details.issues.map((issue: FlowIssue, num: number) => (
        <div key={getIssueKey(issue) + num} className={styles.message}>
          <div className={styles.header}>{typeConfig.name}:</div> {renderIssue(issue)}
        </div>
      ));

      return (
        <div key={getIssueKey(details.issues[0]) + '_detail'}>
          {languageHeader}
          <div className={styles.details} onClick={() => this.handleIssueClicked(details)}>
            {locationHeader}
            <div className={styles.issues_code}>{issues}</div>
          </div>
        </div>
      );
    });

    const classes = cx({
      [styles.visible]: this.state.visible,
      [styles.hidden]: this.props.popped && this.props.popped !== PopTabType.ISSUES_TAB
    });

    return (
      <div className={classes}>
        <div className={styles.mask} />
        <PopTab
          header={`${i18n.t('issues.label', 'Flow Issues')} (${issueCount})`}
          label={i18n.t('issues.header', 'Flow Issues')}
          color="tomato"
          icon="fe-warning"
          top="416px"
          visible={this.state.visible}
          onShow={this.handleTabClicked}
          onHide={this.handleTabClicked}
        >
          <div className={styles.issues_wrapper}>{issues}</div>
        </PopTab>
      </div>
    );
  }
}
