import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getDraggedFrom } from '~/components/helpers';
import Modal from '~/components/modal/Modal';
import { Type } from '~/config/typeConfigs';
import { Action, AnyAction, FlowDefinition } from '~/flowTypes';
import { Asset } from '~/store/flowContext';
import { IncrementSuggestedResultNameCount, UpdateUserAddingAction } from '~/store/actionTypes';
import { AssetStore, incrementSuggestedResultNameCount, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, updateUserAddingAction } from '~/store/nodeEditor';
import AppState from '~/store/state';
import {
    DispatchWithState,
    GetState,
    HandleTypeConfigChange,
    handleTypeConfigChange,
    LocalizationUpdates,
    MergeEditorState,
    mergeEditorState,
    NoParamsAC,
    OnUpdateAction,
    onUpdateAction,
    onUpdateLocalizations,
    OnUpdateLocalizations,
    OnUpdateRouter,
    onUpdateRouter,
    resetNodeEditingState
} from '~/store/thunks';

export type UpdateLocalizations = (language: string, changes: LocalizationUpdates) => void;

// TODO: Remove use of Function
// tslint:disable:ban-types
export interface NodeEditorPassedProps {
    plumberConnectExit: Function;
    plumberRepaintForDuration: Function;
}

export interface NodeEditorStoreProps {
    assets: AssetStore;
    language: Asset;
    definition: FlowDefinition;
    translating: boolean;
    typeConfig: Type;
    suggestedNameCount: number;
    settings: NodeEditorSettings;
    nodes: { [uuid: string]: RenderNode };
    handleTypeConfigChange: HandleTypeConfigChange;
    resetNodeEditingState: NoParamsAC;
    mergeEditorState: MergeEditorState;
    onUpdateLocalizations: OnUpdateLocalizations;
    onUpdateAction: OnUpdateAction;
    onUpdateRouter: OnUpdateRouter;
    updateUserAddingAction: UpdateUserAddingAction;
    incrementSuggestedResultNameCount: IncrementSuggestedResultNameCount;
}

export type NodeEditorProps = NodeEditorPassedProps & NodeEditorStoreProps;

export interface FormProps {
    // our two ways of updating
    updateRouter(renderNode: RenderNode): void;
    updateAction(action: AnyAction): void;

    assets: AssetStore;

    nodeSettings?: NodeEditorSettings;
    typeConfig?: Type;
    onTypeChange?(config: Type): void;
    onClose?(canceled: boolean): void;
}

export interface LocalizationProps {
    nodeSettings?: NodeEditorSettings;
    typeConfig?: Type;
    onClose?(canceled: boolean): void;

    updateLocalizations: UpdateLocalizations;
    language: Asset;
}

export class NodeEditor extends React.Component<NodeEditorProps> {
    constructor(props: NodeEditorProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^close/, /^update/]
        });
    }

    private updateLocalizations(language: string, changes: LocalizationUpdates): void {
        this.props.onUpdateLocalizations(language, changes);
    }

    public close(canceled: boolean): void {
        // Make sure we re-wire the old connection
        if (canceled) {
            const dragPoint = getDraggedFrom(this.props.settings.originalNode);
            if (dragPoint) {
                const renderNode = this.props.nodes[dragPoint.nodeUUID];
                for (const exit of renderNode.node.exits) {
                    if (exit.uuid === dragPoint.exitUUID) {
                        // TODO: should this just be taking literal uuids instead of objects?
                        this.props.plumberConnectExit(renderNode.node, exit);
                        break;
                    }
                }
            }
        }

        this.props.resetNodeEditingState();
        this.props.updateUserAddingAction(false);
    }

    private updateAction(
        action: Action,
        onUpdated?: (dispatch: DispatchWithState, getState: GetState) => void
    ): void {
        this.props.onUpdateAction(action, onUpdated);
    }

    private updateRouter(renderNode: RenderNode): void {
        this.props.onUpdateRouter(renderNode);
    }

    public render(): JSX.Element {
        if (this.props.settings) {
            const { typeConfig } = this.props;

            // see if we should use the localization form
            if (this.props.translating) {
                const { localization: LocalizationForm } = typeConfig;

                if (LocalizationForm) {
                    const localizationProps: LocalizationProps = {
                        updateLocalizations: this.updateLocalizations,
                        nodeSettings: this.props.settings,
                        typeConfig: this.props.typeConfig,
                        onClose: this.close,
                        language: this.props.language
                    };

                    return (
                        <Modal width="600px" show={true}>
                            <LocalizationForm {...{ ...localizationProps }} />
                        </Modal>
                    );
                }
            }

            const { form: Form } = typeConfig;
            const formProps: FormProps = {
                assets: this.props.assets,
                updateAction: this.updateAction,
                updateRouter: this.updateRouter,
                nodeSettings: this.props.settings,
                typeConfig: this.props.typeConfig,
                onTypeChange: this.props.handleTypeConfigChange,
                onClose: this.close
            };

            return (
                <Modal width="600px" show={true}>
                    <Form {...{ ...formProps }} />
                </Modal>
            );
        }
        return null;
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: {
        definition,
        nodes,
        results: { suggestedNameCount },
        assets
    },
    editorState: { language, translating },
    nodeEditor: { typeConfig, settings }
}: AppState) => ({
    language,
    definition,
    nodes,
    translating,
    typeConfig,
    suggestedNameCount,
    settings,
    assets
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            resetNodeEditingState,
            mergeEditorState,
            handleTypeConfigChange,
            onUpdateLocalizations,
            onUpdateAction,
            onUpdateRouter,
            updateUserAddingAction,
            incrementSuggestedResultNameCount
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NodeEditor);
