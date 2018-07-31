// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DragPoint } from '~/components/flow/node/Node';
import { CaseElementProps } from '~/components/form/case/CaseElement';
import Modal from '~/components/modal/Modal';
import { Operators } from '~/config/operatorConfigs';
import { Type } from '~/config/typeConfigs';
import { Action, AnyAction, FlowDefinition, FlowNode, SwitchRouter, WaitTypes } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import {
    AppState,
    DispatchWithState,
    LocalizationUpdates,
    NoParamsAC,
    onUpdateAction,
    OnUpdateAction,
    OnUpdateLocalizations,
    onUpdateLocalizations,
    OnUpdateRouter,
    onUpdateRouter,
    resetNodeEditingState,
    UpdateNodeEditorOpen,
    updateNodeEditorOpen,
    UpdateOperand,
    updateOperand,
    updateResultName,
    UpdateResultName,
    updateShowResultName,
    UpdateShowResultName,
    UpdateUserAddingAction,
    updateUserAddingAction
} from '~/store';
import { IncrementSuggestedResultNameCount } from '~/store/actionTypes';
import { incrementSuggestedResultNameCount, RenderNode } from '~/store/flowContext';
import { NodeEditorForm, NodeEditorSettings } from '~/store/nodeEditor';
import { HandleTypeConfigChange, handleTypeConfigChange } from '~/store/thunks';

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
    resultName: string;
    showResultName: boolean;
    suggestedNameCount: number;
    operand: string;
    timeout: number;
    settings: NodeEditorSettings;
    pendingConnection: DragPoint;
    nodes: { [uuid: string]: RenderNode };
    updateResultName: UpdateResultName;
    updateOperand: UpdateOperand;
    handleTypeConfigChange: HandleTypeConfigChange;
    resetNodeEditingState: NoParamsAC;
    updateNodeEditorOpen: UpdateNodeEditorOpen;
    onUpdateLocalizations: OnUpdateLocalizations;
    onUpdateAction: OnUpdateAction;
    onUpdateRouter: OnUpdateRouter;
    updateUserAddingAction: UpdateUserAddingAction;
    updateShowResultName: UpdateShowResultName;
    incrementSuggestedResultNameCount: IncrementSuggestedResultNameCount;
    form: NodeEditorForm;
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

export const hasSwitchRouter = (node: FlowNode): boolean =>
    (node.router as SwitchRouter) && (node.router as SwitchRouter).hasOwnProperty('operand');

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

export const groupsToCases = (groups: Asset[] = []): CaseElementProps[] =>
    groups.map(({ name, id }: Asset) => ({
        uuid: id,
        kase: {
            uuid: id,
            type: Operators.has_group,
            arguments: [id],
            exit_uuid: ''
        },
        exitName: name
    }));

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
    private updateGroupsRouter(groups: Asset[]): void {
        const currentCases = groupsToCases(groups);
        const { cases, exits, defaultExit } = this.resolveExits(currentCases);

        if (
            this.props.definition.localization &&
            Object.keys(this.props.definition.localization).length
        ) {
            this.cleanUpLocalizations(currentCases);
        }

        const router: SwitchRouter = {
            type: RouterTypes.switch,
            cases,
            default_exit_uuid: defaultExit,
            operand: GROUPS_OPERAND,
            result_name: ''
        };

        if (this.props.resultName) {
            router.result_name += this.props.resultName;
        }

        this.updateSuggestedResultNameState(router.result_name);

        const newNode = this.getUpdatedRouterNode(router, exits, this.props.typeConfig.type);
        newNode.node.wait = { type: WaitTypes.group };
        this.props.onUpdateRouter(newNode);
    }

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
    nodeEditor: { typeConfig, resultName, showResultName, settings, operand, timeout, form }
}: AppState) => ({
    language,
    nodeEditorOpen,
    definition,
    nodes,
    translating,
    typeConfig,
    resultName,
    showResultName,
    suggestedNameCount,
    operand,
    timeout,
    pendingConnection,
    settings,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateResultName,
            resetNodeEditingState,
            updateNodeEditorOpen,
            handleTypeConfigChange,
            updateOperand,
            onUpdateLocalizations,
            onUpdateAction,
            onUpdateRouter,
            updateUserAddingAction,
            updateShowResultName,
            incrementSuggestedResultNameCount
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NodeEditor);
