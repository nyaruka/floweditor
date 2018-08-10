import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DragPoint } from '~/components/flow/node/Node';
import Modal from '~/components/modal/Modal';
import { Type } from '~/config/typeConfigs';
import { Action, AnyAction, FlowDefinition } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { IncrementSuggestedResultNameCount, UpdateUserAddingAction } from '~/store/actionTypes';
import { incrementSuggestedResultNameCount, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, updateUserAddingAction } from '~/store/nodeEditor';
import AppState from '~/store/state';
import {
    DispatchWithState,
    handleTypeConfigChange,
    HandleTypeConfigChange,
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
    language: Asset;
    nodeEditorOpen: boolean;
    definition: FlowDefinition;
    translating: boolean;
    typeConfig: Type;
    suggestedNameCount: number;
    settings: NodeEditorSettings;
    pendingConnection: DragPoint;
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
            if (this.props.pendingConnection) {
                const renderNode = this.props.nodes[this.props.pendingConnection.nodeUUID];
                for (const exit of renderNode.node.exits) {
                    if (exit.uuid === this.props.pendingConnection.exitUUID) {
                        // TODO: should this just be taking literal uuids instead of objects?
                        this.props.plumberConnectExit(renderNode.node, exit);
                        break;
                    }
                }
            }
        }

        this.props.resetNodeEditingState();
        this.props.updateUserAddingAction(false);
        this.props.mergeEditorState({ nodeEditorOpen: false });
    }

    private updateAction(action: Action): void {
        this.props.onUpdateAction(action);
    }

    private updateRouter(renderNode: RenderNode): void {
        this.props.onUpdateRouter(renderNode);
    }

    public render(): JSX.Element {
        if (this.props.nodeEditorOpen) {
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
                        <Modal width="600px" show={this.props.nodeEditorOpen}>
                            <LocalizationForm {...{ ...localizationProps }} />
                        </Modal>
                    );
                }
            }

            const { form: Form } = typeConfig;
            const formProps: FormProps = {
                updateAction: this.updateAction,
                updateRouter: this.updateRouter,
                nodeSettings: this.props.settings,
                typeConfig: this.props.typeConfig,
                onTypeChange: this.props.handleTypeConfigChange,
                onClose: this.close
            };

            return (
                <Modal width="600px" show={this.props.nodeEditorOpen}>
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
        results: { suggestedNameCount }
    },
    editorState: { language, translating, nodeEditorOpen, pendingConnection },
    nodeEditor: { typeConfig, settings }
}: AppState) => ({
    language,
    nodeEditorOpen,
    definition,
    nodes,
    translating,
    typeConfig,
    suggestedNameCount,
    pendingConnection,
    settings
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
