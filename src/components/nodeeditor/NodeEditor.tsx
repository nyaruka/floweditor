import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DragPoint } from '~/components/flow/node/Node';
import Modal from '~/components/modal/Modal';
import { Type } from '~/config/typeConfigs';
import { Action, AnyAction, FlowDefinition, FlowNode, SwitchRouter, WaitTypes } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import {
    AppState,
    DispatchWithState,
    LocalizationUpdates,
    NoParamsAC,
    OnUpdateAction,
    onUpdateAction,
    OnUpdateLocalizations,
    onUpdateLocalizations,
    OnUpdateRouter,
    onUpdateRouter,
    resetNodeEditingState,
    UpdateNodeEditorOpen,
    updateNodeEditorOpen,
    UpdateUserAddingAction,
    updateUserAddingAction
} from '~/store';
import { IncrementSuggestedResultNameCount } from '~/store/actionTypes';
import { incrementSuggestedResultNameCount, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { HandleTypeConfigChange, handleTypeConfigChange } from '~/store/thunks';

// TODO: Remove use of Function
// tslint:disable:ban-types
export type GetResultNameField = () => JSX.Element;
export type UpdateLocalizations = (language: string, changes: LocalizationUpdates) => void;

interface Sides {
    front: JSX.Element;
    back: JSX.Element;
}

export enum DefaultExitNames {
    All_Responses = 'All Responses',
    No_Response = 'No Response',
    Any_Value = 'Any Value',
    Other = 'Other'
}

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
    updateNodeEditorOpen: UpdateNodeEditorOpen;
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

export const hasCases = (node: FlowNode): boolean => {
    if (
        node.router &&
        (node.router as SwitchRouter).cases &&
        (node.router as SwitchRouter).cases.length
    ) {
        return true;
    }
    return false;
};

/**
 * Determine whether Node has a 'wait' property
 */
export const hasWait = (node: FlowNode, type?: WaitTypes): boolean => {
    if (!node || !node.wait || !node.wait.type || (type && node.wait.type !== type)) {
        return false;
    }
    return node.wait.type in WaitTypes;
};

export class NodeEditor extends React.Component<NodeEditorProps> {
    constructor(props: NodeEditorProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^close/, /^update/]
        });
    }

    // Allow return key to submit our form
    /*
    private onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void {
        // Return key
        if (event.which === 13) {
            const isTextarea = $(event.target).prop('tagName') === 'TEXTAREA';
            if (!isTextarea || event.shiftKey) {
                event.preventDefault();
                if (this.submit()) {
                    this.close(false);
                }
            }
        }
    }
    */

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
        this.props.updateNodeEditorOpen(false);
    }

    private updateAction(action: Action): void {
        this.props.onUpdateAction(action);
    }

    private updateRouter(renderNode: RenderNode): void {
        this.props.onUpdateRouter(renderNode);
    }

    /* 
    public updateSubflowRouter(): void {
        // prettier-ignore
        const action = getAction(
            this.props.settings.originalAction,
            this.props.typeConfig
        );

        // prettier-ignore
        const {
            state: {
                flow:
                {
                    name: flowName,
                    id: flowUUID
                }
            }
        } = this.widgets.Flow;

        const newAction: StartFlow = {
            uuid: action.uuid,
            type: this.props.typeConfig.type,
            flow: { name: flowName, uuid: flowUUID }
        };

        // If we're already a subflow, lean on those exits and cases
        let exits: Exit[];
        let cases: Case[];

        // TODO: we should probably just be passing down RenderNode
        const renderNode = this.props.nodes[this.props.settings.originalNode.node.uuid];

        if (renderNode && renderNode.ui.type === 'subflow') {
            ({ exits } = this.props.settings.originalNode.node);
            ({ cases } = this.props.settings.originalNode.node.router as SwitchRouter);
        } else {
            // Otherwise, let's create some new ones
            exits = [
                {
                    uuid: generateUUID(),
                    name: StartFlowExitNames.Complete,
                    destination_node_uuid: null
                },
                {
                    uuid: generateUUID(),
                    name: StartFlowExitNames.Expired,
                    destination_node_uuid: null
                }
            ];

            cases = [
                {
                    uuid: generateUUID(),
                    type: Operators.is_text_eq,
                    arguments: ['child.run.status', 'completed'],
                    exit_uuid: exits[0].uuid
                },
                {
                    uuid: generateUUID(),
                    arguments: ['child.run.status', 'expired'],
                    type: Operators.is_text_eq,
                    exit_uuid: exits[1].uuid
                }
            ];
        }

        const router: SwitchRouter = {
            type: RouterTypes.switch,
            operand: '@child',
            cases,
            default_exit_uuid: null
        };

        const newNode = this.getUpdatedRouterNode(router, exits, UINodeTypes.subflow, [newAction], {
            type: WaitTypes.flow,
            flow_uuid: flowUUID
        } as Wait);
        this.props.onUpdateRouter(newNode);
    }
    */

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
    flowEditor: {
        editorUI: { language, translating, nodeEditorOpen },
        flowUI: { pendingConnection }
    },
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
            updateNodeEditorOpen,
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
