import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import shared from 'components/shared.module.scss';
import TitleBar from 'components/titlebar/TitleBar';
import { fakePropType } from 'config/ConfigProvider';
import { Types } from 'config/interfaces';
import { getTypeConfig } from 'config/typeConfigs';
import { Action, AnyAction, Endpoints, LocalizationMap, FlowIssue } from 'flowTypes';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Asset, RenderNode, AssetStore } from 'store/flowContext';
import AppState from 'store/state';
import {
  ActionAC,
  DispatchWithState,
  moveActionUp,
  OnOpenNodeEditor,
  onOpenNodeEditor,
  removeAction
} from 'store/thunks';
import { createClickHandler, getLocalization } from 'utils';

import styles from './Action.module.scss';
import { hasIssues } from 'components/flow/helpers';
import MountScroll from 'components/mountscroll/MountScroll';

export interface ActionWrapperPassedProps {
  first: boolean;
  action: AnyAction;
  localization: LocalizationMap;
  selected: boolean;
  issues: FlowIssue[];
  render: (action: AnyAction, endpoints: Endpoints) => React.ReactNode;
}

export interface ActionWrapperStoreProps {
  assetStore: AssetStore;
  renderNode: RenderNode;
  language: Asset;
  translating: boolean;
  onOpenNodeEditor: OnOpenNodeEditor;
  removeAction: ActionAC;
  moveActionUp: ActionAC;
  scrollToAction: string;
}

export type ActionWrapperProps = ActionWrapperPassedProps & ActionWrapperStoreProps;

export const actionContainerSpecId = 'action-container';
export const actionOverlaySpecId = 'action-overlay';
export const actionInteractiveDivSpecId = 'interactive-div';
export const actionBodySpecId = 'action-body';

const cx: any = classNames.bind({ ...shared, ...styles });

// Note: this needs to be a ComponentClass in order to work w/ react-flip-move
export class ActionWrapper extends React.Component<ActionWrapperProps> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: ActionWrapperProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleActionClicked(event: React.MouseEvent<HTMLElement>): void {
    const target = event.target as any;

    const showAdvanced =
      target && target.attributes && target.getAttribute('data-advanced') === 'true';

    this.props.onOpenNodeEditor({
      originalNode: this.props.renderNode,
      originalAction: this.props.action,
      showAdvanced
    });
  }

  public handleRemoval(event: React.MouseEvent<HTMLDivElement>): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.props.removeAction(this.props.renderNode.node.uuid, this.props.action);
  }

  public handleMoveUp(event: React.MouseEvent<HTMLDivElement>): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.props.moveActionUp(this.props.renderNode.node.uuid, this.props.action);
  }

  public getAction(): Action {
    // if we are translating, us our localized version
    if (this.props.translating) {
      const localization = getLocalization(
        this.props.action,
        this.props.localization,
        this.props.language
      );
      return localization.getObject() as AnyAction;
    }

    return this.props.action;
  }

  private getClasses(): string {
    const localizedKeys = [];
    let missingLocalization = false;

    if (this.props.translating) {
      if (
        this.props.action.type === Types.send_msg ||
        this.props.action.type === Types.send_broadcast ||
        this.props.action.type === Types.say_msg
      ) {
        localizedKeys.push('text');
      }

      if (this.props.action.type === Types.send_email) {
        localizedKeys.push('subject');
      }

      if (localizedKeys.length !== 0) {
        const localization = getLocalization(
          this.props.action,
          this.props.localization,
          this.props.language
        );

        if (localization.isLocalized()) {
          for (const key of localizedKeys) {
            if (!(key in localization.localizedKeys)) {
              missingLocalization = true;
              break;
            }
          }
        } else {
          missingLocalization = true;
        }
      }
    }

    const notLocalizable = this.props.translating && localizedKeys.length === 0;

    return cx({
      [styles.action]: true,
      [styles.has_router]:
        this.props.renderNode.node.hasOwnProperty('router') &&
        this.props.renderNode.node.router !== null,
      [styles.translating]: this.props.translating,
      [styles.not_localizable]: notLocalizable,
      [styles.missing_localization]: missingLocalization,
      [styles.localized]: !notLocalizable && !missingLocalization
    });
  }

  public render(): JSX.Element {
    const { name } = getTypeConfig(this.props.action.type);

    const classes = this.getClasses();
    const actionToInject = this.getAction();

    let titleBarClass = (shared as any)[this.props.action.type] || shared.missing;
    const actionClass = (styles as any)[this.props.action.type] || styles.missing;
    const showRemoval = !this.props.translating;
    const showMove = !this.props.first && !this.props.translating;

    if (hasIssues(this.props.issues, this.props.translating, this.props.language)) {
      titleBarClass = shared.missing;
    }

    const events = this.context.config.mutable
      ? createClickHandler(this.handleActionClicked, () => this.props.selected)
      : {};

    const body = (
      <>
        <TitleBar
          __className={titleBarClass}
          title={name}
          onRemoval={this.handleRemoval}
          showRemoval={showRemoval}
          showMove={showMove}
          onMoveUp={this.handleMoveUp}
          shouldCancelClick={() => this.props.selected}
        />
        <div className={styles.body + ' ' + actionClass} data-spec={actionBodySpecId}>
          {this.props.render(actionToInject, this.context.config.endpoints)}
        </div>
      </>
    );
    return (
      <div
        id={`action-${this.props.action.uuid}`}
        className={classes}
        data-spec={actionContainerSpecId}
      >
        <div className={styles.overlay} data-spec={actionOverlaySpecId} />
        <div {...events} data-spec={actionInteractiveDivSpecId}>
          {this.props.scrollToAction && this.props.scrollToAction === this.props.action.uuid ? (
            <MountScroll pulseAfterScroll={true}>{body}</MountScroll>
          ) : (
            body
          )}
        </div>
      </div>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = ({
  flowContext: {
    assetStore,
    definition: { localization }
  },
  editorState: { language, translating, scrollToAction }
}: AppState) => ({
  scrollToAction,
  assetStore,
  language,
  translating,
  localization
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators(
    {
      onOpenNodeEditor,
      removeAction,
      moveActionUp
    },
    dispatch
  );

const ConnectedActionWrapper = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(ActionWrapper);

export default ConnectedActionWrapper;
