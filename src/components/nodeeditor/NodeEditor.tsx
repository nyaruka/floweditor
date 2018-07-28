// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v4 as generateUUID } from 'uuid';
import { DragPoint } from '~/components/flow/node/Node';
import { Methods } from '~/components/flow/routers/webhook/helpers';
import { CaseElementProps } from '~/components/form/case/CaseElement';
import Modal from '~/components/modal/Modal';
import * as shared from '~/components/shared.scss';
import { Operators } from '~/config/operatorConfigs';
import { FormHelper, Mode, Type, Types } from '~/config/typeConfigs';
import {
    Action,
    AddLabels,
    AnyAction,
    CallWebhook,
    Case,
    ChangeGroups,
    Exit,
    FlowDefinition,
    FlowNode,
    SendEmail,
    SetContactField,
    SetRunResult,
    StartFlow,
    SwitchRouter,
    WaitTypes
} from '~/flowTypes';
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
export type SaveLocalizations = (
    widgets: { [name: string]: any },
    cases?: CaseElementProps[]
) => void;
export type CleanUpLocalizations = (cases: CaseElementProps[]) => void;
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
    action: AnyAction;
    formHelper: FormHelper;
    cleanUpLocalizations: CleanUpLocalizations;
    updateLocalizations: UpdateLocalizations;

    // our two ways of updating
    updateRouter(renderNode: RenderNode): void;
    updateAction(action: AnyAction): void;

    nodeSettings?: NodeEditorSettings;
    typeConfig?: Type;
    onTypeChange?(config: Type): void;
    onClose?(canceled: boolean): void;
    translating: boolean;
    language: Asset;
}

export interface CombinedExits {
    cases: Case[];
    exits: Exit[];
    defaultExit: string;
}

interface HeaderMap {
    [name: string]: string;
}

export const mapExits = (exits: Exit[]): { [uuid: string]: Exit } =>
    exits.reduce(
        (map, exit) => {
            map[exit.uuid] = exit;
            return map;
        },
        {} as { [uuid: string]: Exit }
    );

export const isSwitchForm = (type: string) =>
    type === Types.wait_for_response ||
    type === Types.split_by_expression ||
    type === Types.split_by_groups;

export const hasSwitchRouter = (node: FlowNode): boolean =>
    (node.router as SwitchRouter) && (node.router as SwitchRouter).hasOwnProperty('operand');

/**
 * Returns existing action (if any), or a bare-bones representation of the form's action.
 */
export const getAction = (actionToEdit: AnyAction, typeConfig: Type): AnyAction => {
    let uuid: string;

    if (actionToEdit) {
        if (
            actionToEdit.type === typeConfig.type ||
            (typeConfig.aliases && actionToEdit.type === typeConfig.aliases[0])
        ) {
            return actionToEdit;
        } else {
            ({ uuid } = actionToEdit);
        }
    }

    let defaultAction: Action = {
        type: typeConfig.type,
        uuid: uuid || generateUUID()
    };

    switch (typeConfig.type) {
        case Types.add_contact_groups:
            defaultAction = { ...defaultAction, groups: null } as ChangeGroups;
            break;
        case Types.remove_contact_groups:
            defaultAction = { ...defaultAction, groups: null } as ChangeGroups;
            break;
        // Note: we change the type config in AttribElement if other than Types.set_contact_field
        case Types.set_contact_field:
            defaultAction = {
                ...defaultAction,
                field: {
                    key: '',
                    name: ''
                },
                value: ''
            } as SetContactField;
            break;
        case Types.send_email:
            defaultAction = {
                ...defaultAction,
                subject: '',
                body: '',
                addresses: null
            } as SendEmail;
            break;
        case Types.set_run_result:
            defaultAction = {
                ...defaultAction,
                name: '',
                value: '',
                category: ''
            } as SetRunResult;
            break;
        case Types.call_webhook:
            defaultAction = { ...defaultAction, url: '', method: Methods.GET } as CallWebhook;
            break;
        case Types.start_flow:
            defaultAction = { ...defaultAction, flow: { name: null, uuid: null } } as StartFlow;
            break;
        case Types.add_input_labels:
            defaultAction = { ...defaultAction, labels: [] } as AddLabels;
            break;
    }

    return defaultAction;
};

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
    private modal: any;
    private form: any;

    constructor(props: NodeEditorProps) {
        super(props);

        bindCallbacks(this, {
            include: [
                /^get/,
                /^close/,
                /^on/,
                /Ref$/,
                /^get/,
                /^add/,
                /^update/,
                /Localizations$/,
                'toggleAdvanced',
                'triggerFormUpdate',
                'removeWidget'
            ]
        });
    }

    private formRef(ref: React.Component<{}>): React.Component<{}> {
        return (this.form = ref);
    }

    private modalRef(ref: any): any {
        return (this.modal = ref);
    }

    // Allow return key to submit our form
    /*private onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void {
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
    }*/

    private updateLocalizations(language: string, changes: LocalizationUpdates): void {
        this.props.onUpdateLocalizations(language, changes);
    }

    /***
     * If the user has a localized 'All Responses' case and no timeout set on the node
     * and they're adding another case, remove translation for the initial case.
     *
     * If the user is going from 1 or more cases to 0 and no timeout is set on the node
     * and this router has a translation for the 'Other' case, lose it.
     */
    private cleanUpLocalizations(cases: CaseElementProps[]): void {
        const { uuid: nodeUUID, exits: nodeExits } = this.props.settings.originalNode.node;
        const exitMap: { [uuid: string]: Exit } = mapExits(nodeExits);
        const updates: LocalizationUpdates = [];
        let lang: string;

        Object.keys(this.props.definition.localization).forEach(iso => {
            const language = this.props.definition.localization[iso];
            Object.keys(language).forEach(localizationUUID => {
                if (exitMap[localizationUUID]) {
                    const exitMatch = exitMap[localizationUUID];
                    if (exitMatch.name) {
                        // don't prune if we have a timeout
                        if (
                            (exitMatch.name === DefaultExitNames.All_Responses &&
                                (this.props.settings.originalNode.node.wait &&
                                    !this.props.settings.originalNode.node.wait.timeout)) ||
                            (exitMatch.name === DefaultExitNames.Other &&
                                (this.props.settings.originalNode.node.wait &&
                                    !this.props.settings.originalNode.node.wait.timeout))
                        ) {
                            lang = iso;
                            updates.push({ uuid: localizationUUID });
                        }
                    }
                }
            });
        });

        this.updateLocalizations(lang, updates);
    }

    /*
    private getLocalizedExits(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }> {
        return this.props.settings.originalNode.node.exits.reduce(
            (results, { uuid: exitUUID }: Exit) => {
                const input = widgets[exitUUID];

                if (input) {
                    // We save localized values as string arrays
                    const value =
                        input.wrappedInstance.state.value.constructor === Array
                            ? input.wrappedInstance.state.value[0].trim()
                            : input.wrappedInstance.state.value.trim();

                    if (value) {
                        results.push({ uuid: exitUUID, translations: { name: [value] } });
                    } else {
                        results.push({ uuid: exitUUID, translations: null });
                    }
                }

                return results;
            },
            []
        );
    }

    private saveLocalizations(widgets: { [name: string]: any }, cases?: CaseElementProps[]): void {
        const updates = [...this.getLocalizedExits(widgets)];

        if (cases && cases.length) {
            updates.push(...this.getLocalizedCases(widgets));
        }

        this.updateLocalizations(this.props.language.id, updates);
    }

    private getLocalizedCases(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }> {
        const results: Array<{ uuid: string; translations: any }> = [];
        const { cases } = this.props.settings.originalNode.node.router as SwitchRouter;

        cases.forEach(({ uuid: caseUUID }) => {
            const input = widgets[caseUUID];

            if (input) {
                const wrappedInstance = input.hasOwnProperty('wrappedInstance');
                const value = wrappedInstance
                    ? input.wrappedInstance.state.value.trim()
                    : input.state.value.trim();

                if (value) {
                    results.push({ uuid: caseUUID, translations: { arguments: [value] } });
                } else {
                    results.push({ uuid: caseUUID, translations: null });
                }
            }
        });

        return results;
    }

    public getExitTranslations(): JSX.Element {
        let languageName: string = 'Spanish';

        if (this.props.translating) {
            ({ name: languageName } = this.props.language);
        }

        if (!languageName) {
            return null;
        }

        const exits: Exit[] = this.props.settings.originalNode.node.exits.reduce(
            (exitList, { uuid: exitUUID, name: exitName }) => {
                const [localized] = this.props.settings.localizations.filter(
                    (localizedObject: LocalizedObject) =>
                        localizedObject.getObject().uuid === exitUUID
                );

                if (localized) {
                    let value = '';

                    if ('name' in localized.localizedKeys) {
                        ({ name: value } = localized.getObject() as Exit);
                    }

                    const placeholder = `${languageName} Translation`;

                    exitList.push(
                        <div key={exitUUID} className={formStyles.translating_exit}>
                            <div data-spec="exit-name" className={formStyles.translating_from}>
                                {exitName}
                            </div>
                            <div className={formStyles.translating_to}>
                                <TextInputElement
                                    data-spec="localization-input"
                                    ref={this.onBindWidget}
                                    name={exitUUID}
                                    placeholder={placeholder}
                                    showLabel={false}
                                    entry={{ value }}
                                />
                            </div>
                        </div>
                    );
                }

                return exitList;
            },
            []
        );

        return (
            <div>
                <div data-spec="title" className={formStyles.title}>
                    Categories
                </div>
                <div data-spec="instructions" className={formStyles.instructions}>
                    When category names are referenced later in the flow, the appropriate language
                    for the category will be used. If no translation is provided, the original text
                    will be used.
                </div>
                <div className={formStyles.translating_exits}>{exits}</div>
            </div>
        );
    } */

    /*
    public submit(): boolean {
        if (
            !(this.form.wrappedInstance
                ? this.form.wrappedInstance.validate()
                : this.form.validate())
        ) {
            return false;
        }

        if (this.props.form && !this.props.form.valid) {
            return false;
        }

        this.form.wrappedInstance
            ? this.form.wrappedInstance.onValid(this.widgets)
            : this.form.onValid(this.widgets);

        this.props.resetNodeEditingState();

        return true;
    }*/

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
        private getUpdatedRouterNode(
        router: Router,
        exits: Exit[],
        type: UINodeTypes | Types,
        actions: Action[] = [],
        wait: Wait = null
    ): RenderNode {
        return {
            node: {
                uuid: this.props.settings.originalNode.node.uuid,
                actions,
                router,
                exits,
                wait
            },
            ui: {
                type,
                position: null
            },
            inboundConnections: {}
        };
    }


    
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

    private getMode(): Mode {
        if (this.props.translating) {
            return Mode.TRANSLATING;
        }

        return Mode.EDITING;
    }

    public render(): JSX.Element {
        if (this.props.nodeEditorOpen) {
            if (this.props.typeConfig.form) {
                const {
                    settings: { originalAction: actionToEdit },
                    typeConfig
                } = this.props;
                const action = getAction(actionToEdit, typeConfig);
                const { form: FormComp } = typeConfig;

                const formProps: Partial<FormProps> = {
                    action,
                    formHelper: typeConfig.formHelper,
                    updateLocalizations: this.updateLocalizations,
                    cleanUpLocalizations: this.cleanUpLocalizations,
                    updateAction: this.updateAction,
                    updateRouter: this.updateRouter,
                    nodeSettings: this.props.settings,
                    typeConfig: this.props.typeConfig,
                    onTypeChange: this.props.handleTypeConfigChange,
                    onClose: this.close,
                    translating: this.props.translating,
                    language: this.props.language
                };

                const style = shared[this.props.typeConfig.type];

                return (
                    <Modal
                        ref={this.modalRef}
                        __className={style}
                        width="600px"
                        show={this.props.nodeEditorOpen}
                    >
                        <FormComp ref={this.formRef} {...{ ...formProps }} />
                    </Modal>
                );
            }
            return null;
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
