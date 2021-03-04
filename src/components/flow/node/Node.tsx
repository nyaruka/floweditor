import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import Counter from 'components/counter/Counter';
import ActionWrapper from 'components/flow/actions/action/Action';
import ExitComp from 'components/flow/exit/Exit';
import {
  getCategoriesForExit,
  getResultName,
  getVisibleActions,
  filterIssuesForAction
} from 'components/flow/node/helpers';
import { getSwitchRouter } from 'components/flow/routers/helpers';
import shared from 'components/shared.module.scss';
import TitleBar from 'components/titlebar/TitleBar';
import { fakePropType } from 'config/ConfigProvider';
import { Types } from 'config/interfaces';
import { getType, getTypeConfig } from 'config/typeConfigs';
import { AnyAction, Exit, FlowNode, FlowIssue } from 'flowTypes';
import * as React from 'react';
import FlipMove from 'react-flip-move';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DebugState } from 'store/editor';
import { AssetMap, RenderNode, Asset } from 'store/flowContext';
import AppState from 'store/state';
import {
  DispatchWithState,
  MergeEditorState,
  mergeEditorState,
  OnAddToNode,
  onAddToNode,
  OnOpenNodeEditor,
  onOpenNodeEditor,
  RemoveNode,
  removeNode
} from 'store/thunks';
import { ClickHandler, createClickHandler } from 'utils';

import styles from './Node.module.scss';
import { hasIssues } from '../helpers';
import MountScroll from 'components/mountscroll/MountScroll';
import i18n from 'config/i18n';

export interface NodePassedProps {
  nodeUUID: string;
  plumberMakeTarget: (id: string) => void;
  plumberRecalculate: (id: string) => void;
  plumberMakeSource: (id: string) => void;
  plumberRemove: (id: string) => void;
  plumberConnectExit: (node: FlowNode, exit: Exit) => void;
  plumberUpdateClass: (
    node: FlowNode,
    exit: Exit,
    className: string,
    confirmDelete: boolean
  ) => void;
  startingNode: boolean;
  onlyNode: boolean;
  selected: boolean;
  ghostRef?: any;
  ghost?: boolean;
}

export interface NodeStoreProps {
  results: AssetMap;
  language: Asset;
  languages: AssetMap;
  activeCount: number;
  translating: boolean;
  simulating: boolean;
  debug: DebugState;
  renderNode: RenderNode;
  issues: FlowIssue[];
  onAddToNode: OnAddToNode;
  onOpenNodeEditor: OnOpenNodeEditor;
  removeNode: RemoveNode;
  mergeEditorState: MergeEditorState;
  scrollToNode: string;
  scrollToAction: string;
}

export type NodeProps = NodePassedProps & NodeStoreProps;

const cx: any = classNames.bind({ ...shared, ...styles });

const EMPTY: any[] = [];
/**
 * A single node in the rendered flow
 */
export class NodeComp extends React.PureComponent<NodeProps> {
  public ele: HTMLDivElement;
  private firstAction: any;
  private clicking: boolean;
  private events: ClickHandler;

  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: NodeProps, context: any) {
    super(props);

    bindCallbacks(this, {
      include: [/Ref$/, /^on/, /^get/, /^handle/]
    });

    this.events = context.config.mutable
      ? createClickHandler(this.onClick, this.handleShouldCancelClick)
      : {};
  }

  private handleShouldCancelClick(): boolean {
    return this.props.selected;
  }

  private eleRef(ref: HTMLDivElement): HTMLDivElement {
    return (this.ele = ref);
  }

  private getGhostListener(): any {
    return (e: MouseEvent) => {
      if (this.ele) {
        let canvas = this.ele.parentElement;
        if (this.ele.parentElement.parentElement) {
          canvas = this.ele.parentElement.parentElement;
        }

        const canvasBounds = canvas.getBoundingClientRect();

        // move our ghost node into position
        const width = this.ele.getBoundingClientRect().width;
        const left = e.pageX - width / 2 - 15 - canvasBounds.left;
        const top = e.pageY - canvasBounds.top - window.scrollY;
        const style = this.ele.style;
        style.left = left + 'px';
        style.top = top + 'px';

        // Hide ourselves if there's a drop target
        style.visibility = document.querySelector('.plumb-drop-hover') ? 'hidden' : 'visible';
      }
    };
  }

  public componentDidMount(): void {
    // Make ourselves a target
    this.props.plumberMakeTarget(this.props.renderNode.node.uuid);

    // Move our drag node around as necessary
    if (this.props.ghost) {
      // We store our listener on the window so flow can remove it
      // this is a bit hacky but allows us to remove our dependency on jquery
      // TODO: rework ghost node to manage its location like other nodes
      const ghostListener: any = this.getGhostListener();
      (window as any).ghostListener = ghostListener;
      document.addEventListener('mousemove', ghostListener);
    }
  }

  public componentDidUpdate(prevProps: any): void {
    // traceUpdate(this, prevProps);

    // when our exits change, we need to recalculate the endpoints
    if (!this.props.ghost) {
      try {
        this.props.plumberRecalculate(this.props.renderNode.node.uuid);
        for (const exit of this.props.renderNode.node.exits) {
          this.props.plumberRecalculate(this.props.renderNode.node.uuid + ':' + exit.uuid);
        }
      } catch (error) {
        // console.log(error);
      }
    }
  }

  public componentWillUnmount(): void {
    this.props.plumberRemove(this.props.renderNode.node.uuid);
  }

  /* istanbul ignore next */
  private handleUUIDClicked(event: React.MouseEvent<HTMLElement>): void {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(event.currentTarget);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    console.log(event.currentTarget.textContent + ' copied to clipboard.');
  }

  private handleAddToNode(): void {
    this.props.onAddToNode(this.props.renderNode.node);
  }

  // Applies only to router nodes;
  // ./Action/Action handles click logic for Action nodes.
  private onClick(event: React.MouseEvent<HTMLElement>): void {
    this.props.onOpenNodeEditor({
      originalNode: this.props.renderNode
    });
  }

  private handleRemoval(event: React.MouseEvent<HTMLElement>): void {
    event.preventDefault();
    event.stopPropagation();
    this.props.removeNode(this.props.renderNode.node);
  }

  private getExits(): JSX.Element[] {
    if (this.props.renderNode.node.exits) {
      return this.props.renderNode.node.exits.map((exit: Exit, idx: number) => (
        <ExitComp
          key={exit.uuid}
          node={this.props.renderNode.node}
          categories={getCategoriesForExit(this.props.renderNode, exit)}
          exit={exit}
          showDragHelper={this.props.onlyNode && idx === 0}
          plumberMakeSource={this.props.plumberMakeSource}
          plumberRemove={this.props.plumberRemove}
          plumberConnectExit={this.props.plumberConnectExit}
          plumberUpdateClass={this.props.plumberUpdateClass}
        />
      ));
    }
    return [];
  }

  private isSelected(): boolean {
    return this.props.selected;
  }

  private isStartNodeVisible(): boolean {
    return this.props.startingNode;
  }

  /* istanbul ignore next */
  private renderDebug(): JSX.Element {
    if (this.props.debug) {
      if (this.props.debug.showUUIDs) {
        return (
          <span
            id={`uuid-${this.props.renderNode.node.uuid}`}
            onClick={this.handleUUIDClicked}
            className={styles.uuid}
          >
            {this.props.renderNode.node.uuid}
          </span>
        );
      }
    }
  }

  public render(): JSX.Element {
    const actions: JSX.Element[] = [];

    let actionList: JSX.Element = null;
    if (this.props.renderNode.node.actions) {
      // Save the first reference off to manage our clicks
      let firstRef: { ref: (ref: any) => any } | {} = {
        ref: (ref: any) => (this.firstAction = ref)
      };

      getVisibleActions(this.props.renderNode).forEach((action: AnyAction, idx: number) => {
        const actionConfig = getTypeConfig(action.type);

        const issues: FlowIssue[] = filterIssuesForAction(
          this.props.nodeUUID,
          action,
          this.props.issues
        );

        if (actionConfig.hasOwnProperty('component') && actionConfig.component) {
          const { component: ActionComponent } = actionConfig;
          if (actionConfig.massageForDisplay) {
            actionConfig.massageForDisplay(action);
          }

          actions.push(
            <ActionWrapper
              {...firstRef}
              key={action.uuid}
              renderNode={this.props.renderNode}
              selected={this.props.selected}
              action={action}
              first={idx === 0}
              issues={issues}
              render={(anyAction: AnyAction) => {
                return (
                  <ActionComponent
                    {...anyAction}
                    languages={this.props.languages}
                    issues={issues}
                  />
                );
              }}
            />
          );
        }

        firstRef = {};
      });

      actionList =
        actions.length > 0 ? (
          <FlipMove enterAnimation="fade" leaveAnimation="fade" duration={300} easing="ease-out">
            {actions}
          </FlipMove>
        ) : null;
    }

    let header: JSX.Element = null;
    let addActions: JSX.Element = null;
    let summary: JSX.Element = null;

    // Router node display logic
    const type = getType(this.props.renderNode);
    if (type !== Types.execute_actions) {
      const config = getTypeConfig(type);
      let title: string = config.name;

      const switchRouter = getSwitchRouter(this.props.renderNode.node);
      if (switchRouter) {
        if (type === Types.split_by_contact_field && this.props.renderNode.ui.config.operand.name) {
          title = `Split by ${this.props.renderNode.ui.config.operand.name}`;
        }
      }

      const resultName = getResultName(this.props.renderNode.node);
      if (resultName) {
        summary = (
          <div {...this.events} className={styles.save_result}>
            <div className={styles.save_as}>{i18n.t('forms.save_as', 'Save as')} </div>
            <div className={styles.result_name}>{resultName}</div>
          </div>
        );
      }

      if (
        title === null &&
        (type === Types.split_by_run_result || type === Types.split_by_run_result_delimited)
      ) {
        title = `Split by ${this.props.results[this.props.renderNode.ui.config.operand.id].name}`;
      }

      if (title === null) {
        title = config.name;
      }

      if (!this.props.renderNode.node.actions || !this.props.renderNode.node.actions.length) {
        // Router headers are introduced here while action headers are introduced in ./Action/Action
        header = (
          // Wrap in a relative parent so it honors node clipping
          <div style={{ position: 'relative' }}>
            <div {...this.events}>
              <TitleBar
                __className={
                  (shared as any)[
                    hasIssues(this.props.issues, this.props.translating, this.props.language)
                      ? 'missing'
                      : config.type
                  ]
                }
                showRemoval={!this.props.translating}
                onRemoval={this.handleRemoval}
                shouldCancelClick={this.handleShouldCancelClick}
                title={title}
              />
            </div>
          </div>
        );
      }
    } else {
      // Don't show add actions option if we are translating
      if (!this.props.translating && this.context.config.mutable) {
        addActions = (
          <div
            className={styles.add}
            {...createClickHandler(this.handleAddToNode, this.handleShouldCancelClick)}
          >
            <span className="fe-add" />
          </div>
        );
      }
    }

    const exits: JSX.Element[] = this.getExits();

    const classes = cx({
      'plumb-drag': true,
      [styles.ghost]: this.props.ghost,
      [styles.flow_start]: this.isStartNodeVisible(),
      [styles.selected]: this.isSelected(),
      [styles.immutable]: !this.context.config.mutable
    });

    const uuid: JSX.Element = this.renderDebug();

    const body = (
      <div className={styles.node}>
        {this.isStartNodeVisible() ? (
          <div className={styles.flow_start_message}>{i18n.t('flow_start', 'Flow Start')}</div>
        ) : null}

        {uuid}
        <Counter
          count={this.props.activeCount}
          containerStyle={styles.active}
          countStyle={''}
          keepVisible={this.props.simulating}
          onClick={() => {
            if (this.context.config.onActivityClicked) {
              this.context.config.onActivityClicked(this.props.nodeUUID, this.props.activeCount);
            }
          }}
        />

        <div className={styles.cropped}>
          {header}
          {actionList}
          {summary}
        </div>

        <div className={`${styles.exit_table}`}>
          <div className={styles.exits} {...this.events}>
            {exits}
          </div>
          {addActions}
        </div>
      </div>
    );

    const renderedNode = (
      <div
        id={this.props.renderNode.node.uuid}
        className={`${styles.node_container} ${classes}`}
        ref={this.eleRef}
      >
        {!this.props.scrollToAction &&
        this.props.scrollToNode &&
        this.props.scrollToNode === this.props.nodeUUID ? (
          <MountScroll pulseAfterScroll={true}>{body}</MountScroll>
        ) : (
          body
        )}
      </div>
    );
    return renderedNode;
  }
}

const mapStateToProps = (
  {
    flowContext: {
      nodes,
      issues,
      assetStore: {
        results: { items: results },
        languages: { items: languages }
      }
    },
    editorState: {
      translating,
      debug,
      ghostNode,
      simulating,
      activity,
      language,
      scrollToAction,
      scrollToNode
    }
  }: AppState,
  props: NodePassedProps
) => {
  let renderNode: RenderNode = null;

  // if we match our ghost node use that
  if (ghostNode && ghostNode.node.uuid === props.nodeUUID) {
    renderNode = ghostNode;
  }

  // otherwise look up our node from the list
  else if (props.nodeUUID in nodes) {
    renderNode = nodes[props.nodeUUID];
  }

  if (!renderNode) {
    throw Error("Couldn't find node for " + props.nodeUUID);
  }

  const activeCount = activity.nodes[props.nodeUUID] || 0;

  // only set our scroll flags if they affect us
  const scrollNode = scrollToNode && scrollToNode === props.nodeUUID ? scrollToNode : null;
  const scrollAction = scrollToAction && scrollNode ? scrollToAction : null;

  return {
    issues: (issues || {})[props.nodeUUID] || EMPTY,
    results,
    language,
    languages,
    activeCount,
    translating,
    debug,
    renderNode,
    simulating,
    scrollToNode: scrollNode,
    scrollToAction: scrollAction
  };
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators(
    {
      onAddToNode,
      onOpenNodeEditor,
      removeNode,
      mergeEditorState
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(NodeComp);
