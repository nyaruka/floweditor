// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v4 as generateUUID } from 'uuid';

import { Mode, Type } from '../../config';
import { Operators } from '../../config/operatorConfigs';
import { Types } from '../../config/typeConfigs';
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
    Methods,
    Router,
    RouterTypes,
    SendEmail,
    SendMsg,
    SetContactField,
    SetContactName,
    SetRunResult,
    StartFlow,
    StartFlowExitNames,
    SwitchRouter,
    UINodeTypes,
    Wait,
    WaitTypes,
    WebhookExitNames
} from '../../flowTypes';
import { Asset } from '../../services/AssetService';
import { LocalizedObject } from '../../services/Localization';
import {
    AppState,
    DispatchWithState,
    LocalizationUpdates,
    NoParamsAC,
    onUpdateAction,
    OnUpdateAction,
    onUpdateLocalizations,
    OnUpdateLocalizations,
    OnUpdateRouter,
    onUpdateRouter,
    resetNodeEditingState,
    UpdateNodeEditorOpen,
    updateNodeEditorOpen,
    UpdateOperand,
    updateOperand,
    UpdateResultName,
    updateResultName,
    updateShowResultName,
    UpdateShowResultName,
    UpdateTypeConfig,
    updateTypeConfig,
    UpdateUserAddingAction,
    updateUserAddingAction
} from '../../store';
import { RenderNode } from '../../store/flowContext';
import { CaseElementProps } from '../form/CaseElement';
import TextInputElement from '../form/TextInputElement';
import { Language } from '../LanguageSelector';
import ConnectedModal, { ButtonSet } from '../Modal';
import { DragPoint } from '../Node';
import * as shared from '../shared.scss';
import { DEFAULT_BODY, GROUPS_OPERAND } from './constants';
import FormContainer from './FormContainer';
import * as formStyles from './NodeEditor.scss';
import TypeList from './TypeList';

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
    nodeToEdit: FlowNode;
    language: Language;
    nodeEditorOpen: boolean;
    actionToEdit: Action;
    localizations: LocalizedObject[];
    definition: FlowDefinition;
    translating: boolean;
    typeConfig: Type;
    resultName: string;
    showResultName: boolean;
    operand: string;
    timeout: number;
    pendingConnection: DragPoint;
    nodes: { [uuid: string]: RenderNode };
    updateResultName: UpdateResultName;
    updateOperand: UpdateOperand;
    updateTypeConfig: UpdateTypeConfig;
    resetNodeEditingState: NoParamsAC;
    updateNodeEditorOpen: UpdateNodeEditorOpen;
    onUpdateLocalizations: OnUpdateLocalizations;
    onUpdateAction: OnUpdateAction;
    onUpdateRouter: OnUpdateRouter;
    updateUserAddingAction: UpdateUserAddingAction;
    updateShowResultName: UpdateShowResultName;
}

export type NodeEditorProps = NodeEditorPassedProps & NodeEditorStoreProps;
export interface FormProps {
    action: AnyAction;
    showAdvanced: boolean;
    updateAction: (action: AnyAction) => void;
    onBindWidget: (ref: any) => void;
    onBindAdvancedWidget: (ref: any) => void;
    updateRouter: Function;
    removeWidget: (name: string) => void;
    getExitTranslations(): JSX.Element;
    triggerFormUpdate: () => void;
    onToggleAdvanced: () => void;
    cleanUpLocalizations: CleanUpLocalizations;
    updateLocalizations: UpdateLocalizations;
    saveLocalizations: SaveLocalizations;
    getResultNameField: GetResultNameField;
    onExpressionChanged: (e: any) => void;
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
        case Types.send_msg:
            defaultAction = { ...defaultAction, text: '', all_urns: false } as SendMsg;
            break;
        case Types.add_contact_groups:
            defaultAction = { ...defaultAction, groups: null } as ChangeGroups;
            break;
        case Types.remove_contact_groups:
            defaultAction = { ...defaultAction, groups: null } as ChangeGroups;
            break;
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
        case Types.set_contact_name:
            defaultAction = {
                ...defaultAction,
                name: ''
            } as SetContactName;
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
    private advanced: any;
    private widgets: { [name: string]: any } = {};
    private advancedWidgets: { [name: string]: boolean } = {};
    private initialButtons: ButtonSet;
    private temporaryButtons?: ButtonSet;

    constructor(props: NodeEditorProps) {
        super(props);

        bindCallbacks(this, {
            include: [
                /^get/,
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

        this.initialButtons = {
            primary: { name: 'Save', onClick: this.onSave },
            secondary: { name: 'Cancel', onClick: this.onCancel }
        };
    }

    private formRef(ref: React.Component<{}>): React.Component<{}> {
        return (this.form = ref);
    }

    private modalRef(ref: any): any {
        return (this.modal = ref);
    }

    // Make NodeEditor aware of base form inputs
    public onBindWidget(widget: any): void {
        if (widget) {
            if (this.widgets) {
                this.widgets[widget.props.name] = widget;
            }
        }
    }

    // Make NodeEditor aware of advanced form inputs
    public onBindAdvancedWidget(widget: any): void {
        if (widget) {
            this.onBindWidget(widget);
            this.advancedWidgets[widget.props.name] = true;
        }
    }

    private onSave(): void {
        if (this.submit()) {
            this.close(false);
        }
    }

    private onCancel(): void {
        this.close(true);
    }

    // Allow return key to submit our form
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

    private onTypeChange(config: Type): void {
        this.widgets = {};
        this.advancedWidgets = {};
        this.props.updateTypeConfig(config);
    }

    private onShowNameField(): void {
        this.props.updateShowResultName(true);
    }

    private onResultNameChange({ target: { value: resultName } }: any): void {
        this.props.updateResultName(resultName);
    }

    private onExpressionChanged({ currentTarget: { value: operand } }: any): void {
        this.props.updateOperand(operand);
    }

    /**
     * Given a set of cases and previous exits, determines correct merging of cases
     * and the union of exits
     */
    private resolveExits(newCases: CaseElementProps[]): CombinedExits {
        // create mapping of our old exit uuids to old exit settings
        const previousExitMap: { [uuid: string]: Exit } = {};

        if (this.props.nodeToEdit.exits) {
            for (const exit of this.props.nodeToEdit.exits) {
                previousExitMap[exit.uuid] = exit;
            }
        }

        const exits: Exit[] = [];
        const cases: Case[] = [];

        // map our new cases to an appropriate exit
        for (const newCase of newCases) {
            // see if we have a suitable exit for our case already
            let existingExit: Exit = null;

            // use our previous exit name if it isn't set
            if (!newCase.exitName && newCase.kase.exit_uuid in previousExitMap) {
                newCase.exitName = previousExitMap[newCase.kase.exit_uuid].name;
            }

            // ignore cases with empty names
            if (!newCase.exitName || newCase.exitName.trim().length === 0) {
                continue;
            }

            if (newCase.exitName) {
                // look through our new exits to see if we've already created one
                for (const exit of exits) {
                    if (newCase.exitName && exit.name) {
                        if (exit.name.toLowerCase() === newCase.exitName.trim().toLowerCase()) {
                            existingExit = exit;
                            break;
                        }
                    }
                }

                // couldn't find a new exit, look through our old ones
                if (!existingExit) {
                    // look through our previous cases for a match
                    if (this.props.nodeToEdit.exits) {
                        for (const exit of this.props.nodeToEdit.exits) {
                            if (newCase.exitName && exit.name) {
                                if (
                                    exit.name.toLowerCase() ===
                                    newCase.exitName.trim().toLowerCase()
                                ) {
                                    existingExit = exit;
                                    exits.push(existingExit);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // we found a suitable exit, point our case to it
            if (existingExit) {
                newCase.kase.exit_uuid = existingExit.uuid;
            } else {
                // no existing exit, create a new one
                // find our previous destination if we have one
                let destination = null;
                if (newCase.kase.exit_uuid in previousExitMap) {
                    destination = previousExitMap[newCase.kase.exit_uuid].destination_node_uuid;
                }

                newCase.kase.exit_uuid = generateUUID();

                exits.push({
                    name: newCase.exitName,
                    uuid: newCase.kase.exit_uuid,
                    destination_node_uuid: destination
                });
            }

            // remove exitName from our case
            cases.push(newCase.kase);
        }

        // add in our default exit
        let defaultUUID = generateUUID();
        if (
            this.props.nodeToEdit.router &&
            this.props.nodeToEdit.router.type === RouterTypes.switch
        ) {
            const router = this.props.nodeToEdit.router as SwitchRouter;
            if (router && router.default_exit_uuid) {
                defaultUUID = router.default_exit_uuid;
            }
        }

        let defaultName = DefaultExitNames.All_Responses;

        if (this.props.nodeToEdit.wait && this.props.nodeToEdit.wait.type === 'exp') {
            defaultName = DefaultExitNames.Any_Value;
        }

        if (exits.length > 0) {
            defaultName = DefaultExitNames.Other;
        }

        let defaultDestination = null;
        if (defaultUUID in previousExitMap) {
            defaultDestination = previousExitMap[defaultUUID].destination_node_uuid;
        }

        exits.push({
            uuid: defaultUUID,
            name: defaultName,
            destination_node_uuid: defaultDestination
        });

        // is a timeout set?
        if (this.props.timeout) {
            // do we have an existing timeout exit?
            const existingExit = this.props.nodeToEdit.exits.find(
                ({ name }) => name === DefaultExitNames.No_Response
            );
            const timeoutExit: Exit = {
                uuid: (existingExit && existingExit.uuid) || generateUUID(),
                name: DefaultExitNames.No_Response,
                destination_node_uuid: null
            };
            // add our timeout exit accordingly
            if (exits[exits.length - 1].name === DefaultExitNames.Other) {
                exits.splice(exits.length - 1, 0, timeoutExit);
            } else {
                exits.push(timeoutExit);
            }

            // Add a case for the timeout.
            // We strip passive cases (like timeouts) when SwitchRouter mounts.
            cases.push({
                uuid: generateUUID(),
                type: Operators.has_wait_timed_out,
                arguments: ['@run'],
                exit_uuid: timeoutExit.uuid
            });
        }

        return { cases, exits, defaultExit: defaultUUID };
    }

    private getResultNameField(): JSX.Element {
        let resultNameField: JSX.Element;
        if (this.props.showResultName) {
            resultNameField = (
                <TextInputElement
                    data-spec="name-field"
                    ref={this.onBindWidget}
                    name="Result Name"
                    showLabel={true}
                    value={this.props.resultName}
                    onChange={this.onResultNameChange}
                    helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
                />
            );
        } else {
            resultNameField = (
                <span
                    data-spec="name-field"
                    className={formStyles.saveLink}
                    onClick={this.onShowNameField}
                >
                    Save as..
                </span>
            );
        }
        return <div className={formStyles.saveAs}>{resultNameField}</div>;
    }

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
        const { uuid: nodeUUID, exits: nodeExits } = this.props.nodeToEdit;
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
                                (this.props.nodeToEdit.wait &&
                                    !this.props.nodeToEdit.wait.timeout)) ||
                            (exitMatch.name === DefaultExitNames.Other &&
                                (this.props.nodeToEdit.wait && !this.props.nodeToEdit.wait.timeout))
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

    private getLocalizedExits(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }> {
        return this.props.nodeToEdit.exits.reduce((results, { uuid: exitUUID }: Exit) => {
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
        }, []);
    }

    private saveLocalizations(widgets: { [name: string]: any }, cases?: CaseElementProps[]): void {
        const updates = [...this.getLocalizedExits(widgets)];

        if (cases && cases.length) {
            updates.push(...this.getLocalizedCases(widgets));
        }

        this.updateLocalizations(this.props.language.iso, updates);
    }

    private getLocalizedCases(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }> {
        const results: Array<{ uuid: string; translations: any }> = [];
        const { cases } = this.props.nodeToEdit.router as SwitchRouter;

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

        const exits: Exit[] = this.props.nodeToEdit.exits.reduce(
            (exitList, { uuid: exitUUID, name: exitName }) => {
                const [localized] = this.props.localizations.filter(
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
                                    value={value}
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
    }

    public submit(): boolean {
        const invalid: any[] = Object.keys(this.widgets).reduce((invalidList, key) => {
            const widget = this.widgets[key];

            if (widget.wrappedInstance) {
                if (!widget.wrappedInstance.validate()) {
                    invalidList.push(widget);
                }
            } else {
                if (!widget.validate()) {
                    invalidList.push(widget);
                }
            }

            return invalidList;
        }, []);

        // If all form inputs are valid, submit it
        if (!invalid.length) {
            this.form.wrappedInstance
                ? this.form.wrappedInstance.onValid(this.widgets)
                : this.form.onValid(this.widgets);

            this.props.resetNodeEditingState();

            return true;
        } else {
            let frontError = false;

            for (const widget of invalid) {
                if (!this.advancedWidgets[widget.props.name]) {
                    frontError = true;
                    break;
                }
            }

            // Show the right pane for the error
            if (
                (frontError && this.modal.state.flipped) ||
                (!frontError && !this.modal.state.flipped)
            ) {
                this.toggleAdvanced();
            }
        }

        return false;
    }

    public close(canceled: boolean): void {
        this.widgets = {};
        this.advancedWidgets = {};

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

    private triggerFormUpdate(): void {
        this.form.wrappedInstance
            ? this.form.wrappedInstance.onUpdateForm(this.widgets)
            : this.form.onUpdateForm(this.widgets);

        if (this.advanced) {
            this.advanced.wrappedInstance
                ? this.advanced.wrappedInstance.onUpdateForm(this.widgets)
                : this.advanced.onUpdateForm(this.widgets);
        }
    }

    private toggleAdvanced(): void {
        if (this.modal) {
            this.modal.toggleFlip();
        }
    }

    private removeWidget(name: string): void {
        delete this.widgets[name];
    }

    private updateAction(action: Action): void {
        console.log('action:', action);
        this.props.onUpdateAction(action);
    }

    private getWait(): Wait {
        const wait: Wait = {} as any;

        if (this.props.typeConfig.type === Types.wait_for_response) {
            wait.type = WaitTypes.msg;
        }

        if (this.props.timeout) {
            wait.timeout = this.props.timeout;
        }

        return wait;
    }

    private updateSwitchRouter(kases: CaseElementProps[]): void {
        if (
            this.props.definition.localization &&
            Object.keys(this.props.definition.localization).length
        ) {
            this.cleanUpLocalizations(kases);
        }

        const { cases, exits, defaultExit } = this.resolveExits(kases);

        const optionalRouter: Pick<Router, 'result_name'> = {};
        if (this.props.resultName) {
            optionalRouter.result_name = this.props.resultName;
        }

        const router: SwitchRouter = {
            type: RouterTypes.switch,
            default_exit_uuid: defaultExit,
            cases,
            operand: this.props.operand,
            ...optionalRouter
        };

        const newRenderNode = this.getUpdatedRouterNode(router, exits, this.props.typeConfig.type);
        newRenderNode.node.wait = this.getWait();

        this.props.onUpdateRouter(newRenderNode);
    }

    private getUpdatedRouterNode(
        router: Router,
        exits: Exit[],
        type: UINodeTypes | Types,
        actions: Action[] = [],
        wait: Wait = null
    ): RenderNode {
        return {
            node: {
                uuid: this.props.nodeToEdit.uuid,
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

    private updateGroupsRouter(): void {
        const { Groups: { state: { groups } } } = this.widgets;

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

        const newNode = this.getUpdatedRouterNode(router, exits, this.props.typeConfig.type);
        newNode.node.wait = { type: WaitTypes.group };
        this.props.onUpdateRouter(newNode);
    }

    public updateSubflowRouter(): void {
        // prettier-ignore
        const action = getAction(
            this.props.actionToEdit,
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
        const renderNode = this.props.nodes[this.props.nodeToEdit.uuid];

        if (renderNode && renderNode.ui.type === 'subflow') {
            ({ exits } = this.props.nodeToEdit);
            ({ cases } = this.props.nodeToEdit.router as SwitchRouter);
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

    private updateWebhookRouter(): void {
        const action = getAction(this.props.actionToEdit, this.props.typeConfig);
        const urlEle = this.widgets.URL.wrappedInstance;

        // Determine method
        let method: Methods = Methods.GET;
        const methodEle = this.widgets.MethodMap;
        if (methodEle.state.value) {
            method = methodEle.state.value;
        }

        // Determine body
        let body = DEFAULT_BODY;
        if (method === Methods.POST || method === Methods.PUT) {
            const bodyEle = this.widgets.Body.wrappedInstance;
            body = bodyEle.state.value;
        }

        // Go through any headers we have
        const headers: HeaderMap = Object.keys(this.widgets).reduce((map, key) => {
            if (key.startsWith('header_')) {
                const header = this.widgets[key];
                const headerName = header.state.name.trim();
                const headerState = header.state.value.trim();

                // Note: we're overwriting headers with the same 'name' value
                if (headerName.length) {
                    map[headerName] = headerState;
                }
            }

            return map;
        }, {});

        const newAction: CallWebhook = {
            uuid: action.uuid,
            type: this.props.typeConfig.type,
            url: urlEle.state.value,
            headers,
            method,
            body
        };

        const exits: Exit[] = [];
        let cases: Case[] = [];

        // TODO: we should probably just be passing down RenderNode
        const renderNode = this.props.nodes[this.props.nodeToEdit.uuid];

        // If we were already a webhook, lean on those exits and cases
        if (renderNode && renderNode.ui.type === 'webhook') {
            this.props.nodeToEdit.exits.forEach(exit => exits.push(exit));
            (this.props.nodeToEdit.router as SwitchRouter).cases.forEach(kase => cases.push(kase));
        } else {
            // Otherwise, let's create some new ones
            exits.push(
                {
                    uuid: generateUUID(),
                    name: WebhookExitNames.Success,
                    destination_node_uuid: null
                },
                {
                    uuid: generateUUID(),
                    name: WebhookExitNames.Failure,
                    destination_node_uuid: null
                },
                {
                    uuid: generateUUID(),
                    name: WebhookExitNames.Unreachable,
                    destination_node_uuid: null
                }
            );

            cases = [
                {
                    uuid: generateUUID(),
                    type: Operators.is_text_eq,
                    arguments: ['run.webhook.status', 'success'],
                    exit_uuid: exits[0].uuid
                },
                {
                    uuid: generateUUID(),
                    type: Operators.is_text_eq,
                    arguments: ['run.webhook.status', 'response_error'],
                    exit_uuid: exits[1].uuid
                },
                {
                    uuid: generateUUID(),
                    type: Operators.is_text_eq,
                    arguments: ['run.webhook.status', 'connection_error'],
                    exit_uuid: exits[2].uuid
                }
            ];
        }

        const router: SwitchRouter = {
            type: RouterTypes.switch,
            operand: '@webhook',
            cases,
            default_exit_uuid: exits[1].uuid
        };

        const newNode = this.getUpdatedRouterNode(router, exits, UINodeTypes.webhook, [newAction]);
        this.props.onUpdateRouter(newNode);
    }

    private getMode(): Mode {
        if (this.props.translating) {
            return Mode.TRANSLATING;
        }

        return Mode.EDITING;
    }

    private hasAdvanced(): boolean {
        const mode: Mode = this.getMode();

        return this.props.typeConfig.allows(mode);
    }

    private getButtons(): ButtonSet {
        if (this.temporaryButtons) {
            return this.temporaryButtons;
        }

        return this.initialButtons;
    }

    private getTitleText(): string {
        if (this.props.translating) {
            return `${this.props.language.name} Translation`;
        }

        return this.props.typeConfig.name;
    }

    private getTitles(): JSX.Element[] {
        const titleText: string = this.getTitleText();
        const titles: JSX.Element[] = [<div key={'front'}>{titleText}</div>];

        if (this.hasAdvanced()) {
            titles.push(
                <div key={'advanced'}>
                    <div>{titleText}</div>
                    <div className={shared.advanced_title}>Advanced Settings</div>
                </div>
            );
        }

        return titles;
    }

    private getTypeList(): JSX.Element {
        if (!this.props.translating) {
            let className: string = '';

            if (isSwitchForm(this.props.typeConfig.type)) {
                ({ type_chooser_switch: className } = formStyles);
            } else {
                ({ type_chooser: className } = formStyles);
            }

            return (
                <TypeList
                    __className={className}
                    // NodeEditor
                    initialType={this.props.typeConfig}
                    onChange={this.onTypeChange}
                />
            );
        }

        return null;
    }

    private getSides(): Sides {
        const { actionToEdit, typeConfig } = this.props;
        const action = getAction(actionToEdit, typeConfig);
        let updateRouter: Function;

        if (
            typeConfig.type === Types.wait_for_response ||
            typeConfig.type === Types.split_by_expression
        ) {
            updateRouter = this.updateSwitchRouter;
        } else if (typeConfig.type === Types.start_flow) {
            updateRouter = this.updateSubflowRouter;
        } else if (typeConfig.type === Types.call_webhook) {
            updateRouter = this.updateWebhookRouter;
        } else if (typeConfig.type === Types.split_by_groups) {
            updateRouter = this.updateGroupsRouter;
        }

        const formProps: Partial<FormProps> = {
            action,
            saveLocalizations: this.saveLocalizations,
            updateLocalizations: this.updateLocalizations,
            cleanUpLocalizations: this.cleanUpLocalizations,
            updateAction: this.updateAction,
            updateRouter,
            getResultNameField: this.getResultNameField,
            getExitTranslations: this.getExitTranslations,
            onBindWidget: this.onBindWidget,
            onBindAdvancedWidget: this.onBindAdvancedWidget,
            onToggleAdvanced: this.toggleAdvanced,
            onExpressionChanged: this.onExpressionChanged,
            triggerFormUpdate: this.triggerFormUpdate,
            removeWidget: this.removeWidget
        };

        const { form: FormComp } = typeConfig;

        const typeList = this.getTypeList();

        const front = (
            <FormContainer key={'fc-front'} onKeyPress={this.onKeyPress}>
                {typeList}
                <FormComp ref={this.formRef} {...{ ...formProps, showAdvanced: false }} />
            </FormContainer>
        );

        let back: JSX.Element = null;

        if (this.hasAdvanced()) {
            back = (
                <FormContainer
                    key={'fc-back'}
                    onKeyPress={this.onKeyPress}
                    __className={formStyles.advanced}
                >
                    <FormComp ref={this.formRef} {...{ ...formProps, showAdvanced: true }} />
                </FormContainer>
            );
        }

        return {
            front,
            back
        };
    }

    public render(): JSX.Element {
        if (this.props.nodeEditorOpen) {
            if (this.props.typeConfig.form) {
                const style = shared[this.props.typeConfig.type];
                const titles: JSX.Element[] = this.getTitles();
                const buttons: ButtonSet = this.getButtons();
                const { front, back }: Sides = this.getSides();
                return (
                    <ConnectedModal
                        ref={this.modalRef}
                        __className={style}
                        width="600px"
                        title={titles}
                        show={this.props.nodeEditorOpen}
                        buttons={buttons}
                    >
                        {front}
                        {back}
                    </ConnectedModal>
                );
            }
            return null;
        }
        return null;
    }
}

const mapStateToProps = ({
    flowContext: { localizations, definition, nodes },
    flowEditor: {
        editorUI: { language, translating, nodeEditorOpen },
        flowUI: { pendingConnection }
    },
    nodeEditor: {
        nodeToEdit,
        actionToEdit,
        typeConfig,
        resultName,
        showResultName,
        operand,
        timeout
    }
}: AppState) => ({
    nodeToEdit,
    language,
    nodeEditorOpen,
    actionToEdit,
    definition,
    localizations,
    nodes,
    translating,
    typeConfig,
    resultName,
    showResultName,
    operand,
    timeout,
    pendingConnection
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateResultName,
            resetNodeEditingState,
            updateNodeEditorOpen,
            updateTypeConfig,
            updateOperand,
            onUpdateLocalizations,
            onUpdateAction,
            onUpdateRouter,
            updateUserAddingAction,
            updateShowResultName
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(NodeEditor);
