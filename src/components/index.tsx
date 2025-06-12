import { react as bindCallbacks } from 'auto-bind';
import Button, { ButtonTypes } from 'components/button/Button';
import Dialog from 'components/dialog/Dialog';
import Flow from 'components/flow/Flow';
import styles from 'components/index.module.scss';
import Loading from 'components/loading/Loading';
import Modal from 'components/modal/Modal';
import { RevisionExplorer } from 'components/revisions/RevisionExplorer';
import { IssuesTab, IssueDetail } from 'components/issues/IssuesTab';
import ConfigProvider from 'config';
import { fakePropType } from 'config/ConfigProvider';
import { FlowDefinition, FlowEditorConfig, AnyAction } from 'flowTypes';
import * as React from 'react';
import { ModalMessage } from 'store/editor';
import { Assets, AssetStore, RenderNodeMap, FlowIssueMap } from 'store/flowContext';
import { getCurrentDefinition } from 'store/helpers';
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

export interface FlowEditorState {
  isTranslating: boolean;
  // State from TembaAppState
  assetStore: AssetStore;
  languages: Assets;
  simulating: boolean;
  fetchingFlow: boolean;
  definition: FlowDefinition;
  issues: FlowIssueMap;
  nodes: RenderNodeMap;
  modalMessage: ModalMessage;
  saving: boolean;
  scrollToNode: string;
  scrollToAction: string;
  popped: string;
}

export const getLabel = (): JSX.Element => {
  return <div>testing</div>;
};

// Root container, wires up context-providers
export const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => {
  return (
    <ConfigProvider config={{ ...config }}>
      <FlowEditor />
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
export class FlowEditor extends React.Component<{}, FlowEditorState> {
  public static contextTypes = contextTypes;

  unsubscribe: () => void;

  constructor(props: {}) {
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

  public mapState(state: TembaAppState): void {
    const languages = state.assetStore ? state.assetStore.languages : null;
    
    const changes = {
      isTranslating: state.isTranslating,
      assetStore: state.assetStore,
      languages,
      simulating: state.editorState ? state.editorState.simulating : false,
      fetchingFlow: state.editorState ? state.editorState.fetchingFlow : false,
      definition: state.flowDefinition,
      issues: state.flowIssues,
      nodes: state.flowNodes,
      modalMessage: state.editorState ? state.editorState.modalMessage : null,
      saving: state.editorState ? state.editorState.saving : false,
      scrollToNode: state.editorState ? state.editorState.scrollToNode : null,
      scrollToAction: state.editorState ? state.editorState.scrollToAction : null,
      popped: state.editorState ? state.editorState.popped : null
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
    // TODO: Convert thunk actions to work with TembaStore
    // const { endpoints, flow, forceSaveOnLoad } = this.context.config;
    // this.props.fetchFlow(endpoints, flow, forceSaveOnLoad);

    // TODO: we want the store to be responsible for this eventually
    // store.loadFlow(flow);

    (window as any).editor = this;
  }

  public reset(): void {
    // TODO: Convert to TembaStore
    // this.props.reset();
  }

  private handleDownloadClicked(): void {
    if (this.state?.definition && this.state?.nodes) {
      downloadJSON(getCurrentDefinition(this.state.definition, this.state.nodes), 'definition');
    }
  }

  private handleVisibilityChanged(visible: boolean): void {
    const currentEditorState = store.getState().editorState;
    store.getState().updateEditorState({
      ...currentEditorState,
      visible,
      activityInterval: ACTIVITY_INTERVAL
    });
  }

  public getAlertModal(): JSX.Element {
    if (!this.state || !this.state.modalMessage) {
      return null;
    }

    return (
      <Modal width="600px" show={true}>
        <Dialog
          className={styles.alert_modal}
          title={this.state.modalMessage.title}
          headerClass="alert"
          buttons={{
            primary: {
              name: 'Ok',
              onClick: () => {
                // Update editor state through TembaStore
                const currentEditorState = store.getState().editorState;
                store.getState().updateEditorState({ 
                  ...currentEditorState,
                  modalMessage: null 
                });
              }
            }
          }}
        >
          <div className={styles.alert_body}>{this.state.modalMessage.body}</div>
        </Dialog>
      </Modal>
    );
  }

  public getSavingIndicator(): JSX.Element {
    if (!this.state || !this.state.saving) {
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
    return !this.state?.fetchingFlow && this.context.config.showDownload ? (
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
    // Update node editor settings through TembaStore
    store.getState().updateNodeEditorSettings({
      originalNode: issueDetail.renderObjects.renderNode,
      originalAction: issueDetail.renderObjects.renderAction
        ? (issueDetail.renderObjects.renderAction.action as AnyAction)
        : null
    });
  }

  private handleScrollToNode(node_uuid: string, action_uuid: string): void {
    const currentEditorState = store.getState().editorState;
    
    if (this.state?.scrollToNode === node_uuid && this.state?.scrollToAction === action_uuid) {
      store.getState().updateEditorState({
        ...currentEditorState,
        scrollToNode: null,
        scrollToAction: null
      });
    }

    onNextRender(() => {
      const currentEditorState = store.getState().editorState;
      store.getState().updateEditorState({
        ...currentEditorState,
        scrollToNode: node_uuid,
        scrollToAction: action_uuid
      });
    });
  }

  public handleScrollToTranslation(translation: TranslationBundle): void {
    this.handleScrollToNode(translation.node_uuid, translation.action_uuid);
  }

  private handleOpenTranslation(translation: TranslationBundle): void {
    const renderNode = this.state?.nodes[translation.node_uuid];
    const action = translation.action_uuid
      ? renderNode?.node.actions?.find(action => action.uuid === translation.action_uuid)
      : null;

    store.getState().updateNodeEditorSettings({
      originalNode: renderNode,
      originalAction: action
    });
  }

  public handleScrollToIssue(issueDetail: IssueDetail): void {
    const issue = issueDetail.issues[0];
    this.handleScrollToNode(issue.node_uuid, issue.action_uuid);
  }

  private handleTabPopped(visible: boolean, tab: PopTabType): void {
    const currentEditorState = store.getState().editorState;
    if (visible) {
      store.getState().updateEditorState({ 
        ...currentEditorState,
        popped: tab 
      });
    } else {
      store.getState().updateEditorState({ 
        ...currentEditorState,
        popped: null 
      });
    }
  }

  public componentDidUpdate(prevState: FlowEditorState): void {
    // traceUpdate(this, prevState);
  }

  public render(): JSX.Element {
    if (!this.state) {
      return null;
    }

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
              Object.keys(this.state.nodes || {}).length > 0 &&
                this.state.languages &&
                Object.keys(this.state.languages.items).length > 0
            )(<LanguageSelector />)}

            {this.getSavingIndicator()}

            {renderIf(this.state.definition && !this.state.fetchingFlow)(<Flow />)}

            {renderIf(
              this.state.definition && this.state.isTranslating && !this.state.fetchingFlow
            )(
              <TranslatorTab
                localization={
                  this.state.definition
                    ? this.state.definition.localization[store.getState().languageCode]
                    : {}
                }
                onTranslationClicked={this.handleScrollToTranslation}
                onTranslationOpened={this.handleOpenTranslation}
                onTranslationFilterChanged={null} // TODO: Convert to TembaStore
                onUpdateLocalizations={null} // TODO: Convert to TembaStore
                translationFilters={
                  this.state.definition ? this.state.definition._ui.translation_filters : null
                }
                nodes={this.state.nodes}
                onToggled={this.handleTabPopped}
                popped={this.state.popped}
              />
            )}

            <RevisionExplorer
              loadFlowDefinition={null} // TODO: Convert to TembaStore
              createNewRevision={null} // TODO: Convert to TembaStore
              assetStore={this.state.assetStore}
              onToggled={this.handleTabPopped}
              popped={this.state.popped}
            />

            {renderIf(Object.keys(this.state.issues).length > 0)(
              <IssuesTab
                issues={this.state.issues}
                onIssueClicked={this.handleScrollToIssue}
                onIssueOpened={this.handleOpenIssue}
                languages={this.state.languages ? this.state.languages.items : {}}
                nodes={this.state.nodes}
                onToggled={this.handleTabPopped}
                popped={this.state.popped}
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

export default FlowEditorContainer;
