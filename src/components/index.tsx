import { react as bindCallbacks } from 'auto-bind';
import Button, { ButtonTypes } from 'components/button/Button';
import Dialog from 'components/dialog/Dialog';
import ConnectedFlow from 'components/flow/Flow';
import styles from 'components/index.module.scss';
import Loading from 'components/loading/Loading';
import Modal from 'components/modal/Modal';
import { RevisionExplorer } from 'components/revisions/RevisionExplorer';
import { IssuesTab, IssueDetail } from 'components/issues/IssuesTab';
import ConfigProvider from 'config';
import { fakePropType } from 'config/ConfigProvider';
import { FlowDefinition, FlowEditorConfig, AnyAction } from 'flowTypes';
import * as React from 'react';
import { connect, Provider as ReduxProvider } from 'react-redux';
import { bindActionCreators } from 'redux';
import createStore from 'store/createStore';
import { ModalMessage } from 'store/editor';
import { Assets, AssetStore, RenderNodeMap, FlowIssueMap } from 'store/flowContext';
import { getCurrentDefinition } from 'store/helpers';
import {
  CreateNewRevision,
  createNewRevision,
  DispatchWithState,
  FetchFlow,
  fetchFlow,
  LoadFlowDefinition,
  loadFlowDefinition,
  MergeEditorState,
  mergeEditorState,
  onOpenNodeEditor,
  OnOpenNodeEditor,
  UpdateTranslationFilters,
  updateTranslationFilters,
  reset,
  Reset,
  OnUpdateLocalizations,
  onUpdateLocalizations
} from 'store/thunks';
import { ACTIVITY_INTERVAL, downloadJSON, renderIf, onNextRender } from 'utils';
import { PopTabType } from 'config/interfaces';
import { TranslatorTab, TranslationBundle } from './translator/TranslatorTab';
import i18n from 'config/i18n';
import { LanguageSelector } from './languageselector/LanguageSelector';
import { store } from 'store';
import { TembaAppState } from 'temba-components';

const { default: PageVisibility } = require('react-page-visibility');

export interface FlowEditorContainerProps {
  config: FlowEditorConfig;
}

export interface FlowEditorStoreProps {
  assetStore: AssetStore;
  languages: Assets;
  simulating: boolean;
  fetchingFlow: boolean;
  definition: FlowDefinition;
  issues: FlowIssueMap;
  fetchFlow: FetchFlow;
  loadFlowDefinition: LoadFlowDefinition;
  createNewRevision: CreateNewRevision;
  mergeEditorState: MergeEditorState;
  onOpenNodeEditor: OnOpenNodeEditor;
  reset: Reset;
  nodes: RenderNodeMap;
  modalMessage: ModalMessage;
  saving: boolean;
  scrollToNode: string;
  scrollToAction: string;
  popped: string;
  updateTranslationFilters: UpdateTranslationFilters;
  onUpdateLocalizations: OnUpdateLocalizations;
}

export interface FlowEditorState {
  isTranslating: boolean;
}

const hotStore = createStore();

export const getLabel = (): JSX.Element => {
  return <div>testing</div>;
};

// Root container, wires up context-providers
export const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => {
  return (
    <ConfigProvider config={{ ...config }}>
      <ReduxProvider store={hotStore as any}>
        <ConnectedFlowEditor />
      </ReduxProvider>
    </ConfigProvider>
  );
};

export const contextTypes = {
  config: fakePropType
};

export const editorContainerSpecId = 'editor-container';
export const editorSpecId = 'editor';

/**
 * The main editor view for editing a flow
 */
export class FlowEditor extends React.Component<FlowEditorStoreProps, FlowEditorState> {
  public static contextTypes = contextTypes;

  unsubscribe: () => void;

  constructor(props: FlowEditorStoreProps) {
    super(props);
    bindCallbacks(this, {
      include: [/^handle/]
    });

    const appState = store.getState();
    this.mapState(appState);

    // subscribe for changes
    this.unsubscribe = store
      .getApp()
      .subscribe((state: TembaAppState, prevState: TembaAppState) => {
        this.mapState(state);
      });
  }

  public mapState(state: any): void {
    const changes = {
      isTranslating: state.isTranslating
    };

    if (this.state) {
      this.setState(changes);
    } else {
      // eslint-disable-next-line
      this.state = changes;
    }
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public componentDidMount(): void {
    const { endpoints, flow, forceSaveOnLoad } = this.context.config;
    this.props.fetchFlow(endpoints, flow, forceSaveOnLoad);

    // TODO: we want the store to be responsible for this eventually
    // store.loadFlow(flow);

    (window as any).editor = this;
  }

  public reset(): void {
    this.props.reset();
  }

  private handleDownloadClicked(): void {
    downloadJSON(getCurrentDefinition(this.props.definition, this.props.nodes), 'definition');
  }

  private handleVisibilityChanged(visible: boolean): void {
    this.props.mergeEditorState({
      visible,
      activityInterval: ACTIVITY_INTERVAL
    });
  }

  public getAlertModal(): JSX.Element {
    if (!this.props.modalMessage) {
      return null;
    }

    return (
      <Modal width="600px" show={true}>
        <Dialog
          className={styles.alert_modal}
          title={this.props.modalMessage.title}
          headerClass="alert"
          buttons={{
            primary: {
              name: 'Ok',
              onClick: () => {
                this.props.mergeEditorState({ modalMessage: null });
              }
            }
          }}
        >
          <div className={styles.alert_body}>{this.props.modalMessage.body}</div>
        </Dialog>
      </Modal>
    );
  }

  public getSavingIndicator(): JSX.Element {
    if (!this.props.saving) {
      return null;
    }

    return (
      <div id="saving_animation" className={styles.saving}>
        <div style={{ position: 'fixed', right: '30px', marginTop: '0px', zIndex: 1 }}>
          <Loading units={5} color="#3498db" size={7} />
        </div>
      </div>
    );
  }

  public getFooter(): JSX.Element {
    return !this.props.fetchingFlow && this.context.config.showDownload ? (
      <div className={styles.footer}>
        <div className={styles.download_button}>
          <Button
            name={i18n.t('buttons.download', 'Download')}
            onClick={this.handleDownloadClicked}
            type={ButtonTypes.primary}
          />
        </div>
      </div>
    ) : null;
  }

  public handleOpenIssue(issueDetail: IssueDetail): void {
    this.props.onOpenNodeEditor({
      originalNode: issueDetail.renderObjects.renderNode,
      originalAction: issueDetail.renderObjects.renderAction
        ? (issueDetail.renderObjects.renderAction.action as AnyAction)
        : null
    });
  }

  private handleScrollToNode(node_uuid: string, action_uuid: string): void {
    if (this.props.scrollToNode === node_uuid && this.props.scrollToAction === action_uuid) {
      this.props.mergeEditorState({
        scrollToNode: null,
        scrollToAction: null
      });
    }

    onNextRender(() => {
      this.props.mergeEditorState({
        scrollToNode: node_uuid,
        scrollToAction: action_uuid
      });
    });
  }

  public handleScrollToTranslation(translation: TranslationBundle): void {
    this.handleScrollToNode(translation.node_uuid, translation.action_uuid);
  }

  private handleOpenTranslation(translation: TranslationBundle): void {
    const renderNode = this.props.nodes[translation.node_uuid];
    const action = translation.action_uuid
      ? renderNode.node.actions.find(action => action.uuid === translation.action_uuid)
      : null;

    this.props.onOpenNodeEditor({
      originalNode: renderNode,
      originalAction: action
    });
  }

  public handleScrollToIssue(issueDetail: IssueDetail): void {
    const issue = issueDetail.issues[0];
    this.handleScrollToNode(issue.node_uuid, issue.action_uuid);
  }

  private handleTabPopped(visible: boolean, tab: PopTabType): void {
    if (visible) {
      this.props.mergeEditorState({ popped: tab });
    } else {
      this.props.mergeEditorState({ popped: null });
    }
  }

  public componentDidUpdate(prevProps: FlowEditorStoreProps): void {
    // traceUpdate(this, prevProps);
  }

  public render(): JSX.Element {
    return (
      <PageVisibility onChange={this.handleVisibilityChanged}>
        <div
          id={editorContainerSpecId}
          className={this.state.isTranslating ? styles.translating : undefined}
          data-spec={editorContainerSpecId}
        >
          {this.getFooter()}
          {this.getAlertModal()}
          <div className={styles.editor} data-spec={editorSpecId}>
            {renderIf(
              Object.keys(this.props.nodes || {}).length > 0 &&
                this.props.languages &&
                Object.keys(this.props.languages.items).length > 0
            )(<LanguageSelector />)}

            {this.getSavingIndicator()}

            {renderIf(this.props.definition && !this.props.fetchingFlow)(<ConnectedFlow />)}

            {renderIf(
              this.props.definition && this.state.isTranslating && !this.props.fetchingFlow
            )(
              <TranslatorTab
                localization={
                  this.props.definition
                    ? this.props.definition.localization[store.getState().languageCode]
                    : {}
                }
                onTranslationClicked={this.handleScrollToTranslation}
                onTranslationOpened={this.handleOpenTranslation}
                onTranslationFilterChanged={this.props.updateTranslationFilters}
                onUpdateLocalizations={this.props.onUpdateLocalizations}
                translationFilters={
                  this.props.definition ? this.props.definition._ui.translation_filters : null
                }
                nodes={this.props.nodes}
                onToggled={this.handleTabPopped}
                popped={this.props.popped}
              />
            )}

            <RevisionExplorer
              loadFlowDefinition={this.props.loadFlowDefinition}
              createNewRevision={this.props.createNewRevision}
              assetStore={this.props.assetStore}
              onToggled={this.handleTabPopped}
              popped={this.props.popped}
            />

            {renderIf(Object.keys(this.props.issues).length > 0)(
              <IssuesTab
                issues={this.props.issues}
                onIssueClicked={this.handleScrollToIssue}
                onIssueOpened={this.handleOpenIssue}
                languages={this.props.languages ? this.props.languages.items : {}}
                nodes={this.props.nodes}
                onToggled={this.handleTabPopped}
                popped={this.props.popped}
              />
            )}
            <div id="portal-root" />
            <div id="canvas-portal" />
          </div>
        </div>
      </PageVisibility>
    );
  }
}

const mapStateToProps = ({
  flowContext: { definition, issues, nodes, assetStore },
  editorState: {
    language,
    fetchingFlow,
    simulating,
    modalMessage,
    saving,
    scrollToAction,
    scrollToNode,
    popped
  }
}: any) => {
  const languages = assetStore ? assetStore.languages : null;

  return {
    popped,
    modalMessage,
    saving,
    simulating,
    assetStore,
    language,
    fetchingFlow,
    definition,
    issues,
    nodes,
    languages,
    scrollToAction,
    scrollToNode
  };
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators(
    {
      fetchFlow,
      loadFlowDefinition,
      createNewRevision,
      mergeEditorState,
      onOpenNodeEditor,
      updateTranslationFilters,
      onUpdateLocalizations,
      reset
    },
    dispatch
  );

export const ConnectedFlowEditor = connect(mapStateToProps, mapDispatchToProps)(FlowEditor);

export default FlowEditorContainer;
