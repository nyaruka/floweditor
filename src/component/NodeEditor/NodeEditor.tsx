import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { react as bindCallbacks } from 'auto-bind';
import Modal, { ButtonSet } from '../Modal';
import {
    FlowDefinition,
    Action,
    AnyAction,
    Router,
    SwitchRouter,
    Exit,
    Node,
    UINode,
    Case,
    Reply,
    ChangeGroup,
    SaveToContact,
    SendEmail,
    SaveFlowResult,
    CallWebhook,
    StartFlow,
    Methods,
    WaitType
} from '../../flowTypes';
import { Type, Mode, getTypeConfig } from '../../config';
import { Language } from '../LanguageSelector';
import ComponentMap, { SearchResult } from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import TypeList from './TypeList';
import TextInputElement from '../form/TextInputElement';
import { CaseElementProps } from '../form/CaseElement';
import { LocalizationUpdates } from '../../services/FlowMutator';
import { DEFAULT_OPERAND, GROUPS_OPERAND, DEFAULT_BODY } from './constants';

import * as formStyles from './NodeEditor.scss';
import * as shared from '../shared.scss';

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

export interface FormProps {
    showAdvanced: boolean;
    node: Node;
    operand: string;
    translating: boolean;
    language: Language;
    definition: FlowDefinition;
    config: Type;
    ComponentMap: ComponentMap;
    updateAction(action: AnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateRouter: Function;
    removeWidget(name: string): void;
    getExitTranslations(): JSX.Element;
    triggerFormUpdate(): void;
    onToggleAdvanced(): void;
    getLocalizedObject: Function;
    cleanUpLocalizations: CleanUpLocalizations;
    updateLocalizations: UpdateLocalizations;
    saveLocalizations: SaveLocalizations;
    getResultNameField: GetResultNameField;
    onExpressionChanged: (e: any) => void;
    action?: AnyAction;
    localizations?: LocalizedObject[];
}

export interface NodeEditorProps {
    node: Node;
    language: Language;
    action?: Action;
    nodeUI?: UINode;
    actionsOnly?: boolean;
    localizations?: LocalizedObject[];
    definition: FlowDefinition;
    translating: boolean;
    show?: boolean;
    onUpdateLocalizations: Function;
    onUpdateAction: Function;
    onUpdateRouter: Function;
    onClose?(canceled: boolean): void;
    ComponentMap: ComponentMap;
}

export interface NodeEditorState {
    config: Type;
    show: boolean;
    resultName: string;
    showResultName: boolean;
    operand: string;
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
    type === 'wait_for_response' || type === 'split_by_expression' || type === 'split_by_group';

export const hasSwitchRouter = (node: Node): boolean =>
    (node.router as SwitchRouter) && (node.router as SwitchRouter).hasOwnProperty('operand');

/**
 * Returns existing action (if any), or a bare-bones representation of the form's action.
 */
export const getAction = ({ action }: NodeEditorProps, config: Type): AnyAction => {
    let uuid: string;

    if (action) {
        if (action.type === config.type || (config.aliases && action.type === config.aliases[0])) {
            return action;
        } else {
            ({ uuid } = action);
        }
    }

    let defaultAction: Action = {
        type: config.type,
        uuid: uuid || generateUUID()
    };

    switch (config.type) {
        case 'reply':
            defaultAction = { ...defaultAction, text: '', all_urns: false } as Reply;
            break;
        case 'add_to_group':
            defaultAction = { ...defaultAction, groups: null } as ChangeGroup;
            break;
        case 'remove_from_group':
            defaultAction = { ...defaultAction, groups: null } as ChangeGroup;
            break;
        case 'save_contact_field':
            defaultAction = {
                ...defaultAction,
                field_uuid: generateUUID(),
                field_name: '',
                value: ''
            } as SaveToContact;
            break;
        case 'send_email':
            defaultAction = { ...defaultAction, subject: '', body: '', emails: null } as SendEmail;
            break;
        case 'save_flow_result':
            defaultAction = {
                ...defaultAction,
                result_name: '',
                value: '',
                category: ''
            } as SaveFlowResult;
            break;
        case 'call_webhook':
            defaultAction = { ...defaultAction, url: '', method: Methods.GET } as CallWebhook;
            break;
        case 'start_flow':
            defaultAction = { ...defaultAction, flow_name: null, flow_uuid: null } as StartFlow;
            break;
    }

    return defaultAction;
};

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 */
export const resolveExits = (newCases: CaseElementProps[], previous: Node): CombinedExits => {
    // create mapping of our old exit uuids to old exit settings
    const previousExitMap: { [uuid: string]: Exit } = {};

    if (previous.exits) {
        for (const exit of previous.exits) {
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
                if (previous.exits) {
                    for (const exit of previous.exits) {
                        if (newCase.exitName && exit.name) {
                            if (exit.name.toLowerCase() === newCase.exitName.trim().toLowerCase()) {
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
    if (previous.router && previous.router.type === 'switch') {
        const router = previous.router as SwitchRouter;
        if (router && router.default_exit_uuid) {
            defaultUUID = router.default_exit_uuid;
        }
    }

    let defaultName = 'All Responses';
    if (exits.length > 0) {
        defaultName = 'Other';
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

    return { cases, exits, defaultExit: defaultUUID };
};

export const hasCases = (node: Node): boolean => {
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
export const hasWait = (node: Node, type?: WaitType): boolean => {
    if (!node || !node.wait || !node.wait.type || (type && node.wait.type !== type)) {
        return false;
    }
    return node.wait.type in WaitType;
};

export const groupsToCases = (groups: SearchResult[] = []): CaseElementProps[] =>
    groups.map(({ name, id }: SearchResult) => ({
        kase: {
            uuid: id,
            type: 'has_group',
            arguments: [id],
            exit_uuid: ''
        },
        exitName: name
    }));

export const FormContainer: React.SFC<{
    onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void;
    __className?: string;
}> = ({ children, onKeyPress, __className }) => (
    <div className={__className ? __className : null}>
        <div className={formStyles.node_editor}>
            <form onKeyPress={onKeyPress}>{children}</form>
        </div>
    </div>
);

export default class NodeEditor extends React.PureComponent<NodeEditorProps, NodeEditorState> {
    private modal: Modal;
    private form: any;
    private advanced: any;
    private widgets: { [name: string]: any } = {};
    private advancedWidgets: { [name: string]: boolean } = {};
    private initialButtons: ButtonSet;
    private temporaryButtons?: ButtonSet;

    constructor(props: NodeEditorProps) {
        super(props);

        this.state = this.getInitialState();

        bindCallbacks(this, {
            include: [
                /^on/,
                /Ref$/,
                /^get/,
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

    private modalRef(ref: Modal): Modal {
        return (this.modal = ref);
    }

    public componentWillReceiveProps(nextProps: NodeEditorProps): void {
        if (nextProps.node.router) {
            if (nextProps.node.router.result_name) {
                if (nextProps.node.router.result_name !== this.state.resultName) {
                    this.setState({
                        resultName: nextProps.node.router.result_name,
                        showResultName: true
                    });
                }
            } else {
                const updates: Partial<NodeEditorState> = {};

                if (this.state.resultName !== '') {
                    updates.resultName = '';
                }

                updates.showResultName = false;

                this.setState(updates as NodeEditorState);
            }
        }
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

        this.setState({
            config
        });
    }

    private onShowNameField(): void {
        this.setState({
            showResultName: true
        });
    }

    private onResultNameChange({ target: { value: resultName } }: any): void {
        this.setState({ resultName, showResultName: resultName.length > 0 });
    }

    private onExpressionChanged({ currentTarget: { value: operand } }: any): void {
        this.setState({
            operand
        });
    }

    private determineConfigType(props: NodeEditorProps): string {
        if (props.action) {
            return props.action.type;
        } else {
            if (props.nodeUI) {
                if (props.nodeUI.type) {
                    return props.nodeUI.type;
                }
            }
        }

        // Account for ghost nodes
        if (props.node) {
            if (props.node.router) {
                return props.node.router.type;
            }

            if (props.node.actions) {
                return props.node.actions[0].type;
            }
        }

        const details = props.ComponentMap.getDetails(props.node.uuid);

        if (details.type) {
            return details.type;
        }

        throw new Error(`Cannot initialize NodeEditor without a valid type: ${props.node.uuid}`);
    }

    private getInitialState(): NodeEditorState {
        const type = this.determineConfigType(this.props);
        const config = getTypeConfig(type);
        const show = this.props.show || false;
        let operand = DEFAULT_OPERAND;
        let resultName = '';

        if (this.props.node.router) {
            if (this.props.node.router.result_name) {
                ({ result_name: resultName } = this.props.node.router);
            }

            if (hasCases(this.props.node)) {
                ({ operand } = this.props.node.router as SwitchRouter);
            }
        }

        return {
            config,
            show,
            resultName,
            showResultName: resultName.length > 0,
            operand
        };
    }

    private getLocalizedObject(): LocalizedObject {
        if (this.props.localizations && this.props.localizations.length) {
            return this.props.localizations[0];
        }
    }

    private getResultNameField(): JSX.Element {
        let resultNameField: JSX.Element;

        if (this.state.showResultName) {
            resultNameField = (
                <TextInputElement
                    data-spec="name-field"
                    ref={this.onBindWidget}
                    name="Result Name"
                    showLabel={true}
                    value={this.state.resultName}
                    onChange={this.onResultNameChange}
                    helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
                    ComponentMap={this.props.ComponentMap}
                    config={this.state.config}
                />
            );
        } else {
            resultNameField = (
                <span
                    data-spec="name-field"
                    className={formStyles.saveLink}
                    onClick={this.onShowNameField}>
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
     * If the user has a localized 'All Responses' case and they're adding another case,
     * remove translation for the initial case.
     * If the user is going from 1 or more cases to 0 and this router has a translation for the 'Other' case, lose it.
     */
    private cleanUpLocalizations(cases: CaseElementProps[]): void {
        const { uuid: nodeUUID, exits: nodeExits } = this.props.node;
        const exitMap: { [uuid: string]: Exit } = mapExits(nodeExits);

        const updates: LocalizationUpdates = [];
        let lang: string;

        Object.keys(this.props.definition.localization).forEach(iso => {
            const language = this.props.definition.localization[iso];
            Object.keys(language).forEach(localizationUUID => {
                if (exitMap[localizationUUID]) {
                    const exitMatch = exitMap[localizationUUID];
                    if (
                        exitMatch.name &&
                        (exitMatch.name === 'All Responses' || exitMatch.name === 'Other')
                    ) {
                        lang = iso;
                        updates.push({ uuid: localizationUUID });
                    }
                }
            });
        });

        this.updateLocalizations(lang, updates);
    }

    private getLocalizedExits(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }> {
        return this.props.node.exits.reduce((results, { uuid: exitUUID }: Exit) => {
            const input = widgets[exitUUID] as TextInputElement;

            if (input) {
                // We save localized values as string arrays
                const value =
                    input.state.value.constructor === Array
                        ? input.state.value[0].trim()
                        : input.state.value.trim();

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

        const { cases } = this.props.node.router as SwitchRouter;

        cases.forEach(({ uuid: caseUUID }) => {
            const input: TextInputElement = widgets[caseUUID];

            if (input) {
                const value = input.state.value.trim();

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

        const exits: Exit[] = this.props.node.exits.reduce(
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
                                    // Node
                                    ComponentMap={this.props.ComponentMap}
                                    config={this.state.config}
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

            if (!widget.validate()) {
                invalidList.push(widget);
            }

            return invalidList;
        }, []);

        // If all form inputs are valid, submit it
        if (!invalid.length) {
            this.form.onValid(this.widgets);

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

    public open(): void {
        const config = getTypeConfig(this.determineConfigType(this.props));

        this.setState({
            show: true,
            config
        });
    }

    public close(canceled: boolean): void {
        this.widgets = {};
        this.advancedWidgets = {};

        this.setState(
            {
                show: false
            },
            () => this.props.onClose(canceled)
        );
    }

    private triggerFormUpdate(): void {
        this.form.onUpdateForm(this.widgets);

        if (this.advanced) {
            this.advanced.onUpdateForm(this.widgets);
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

    private updateAction(act: Action): void {
        this.props.onUpdateAction(this.props.node, act);
    }

    private updateRouter(node: Node, type: string, previousAction?: Action): void {
        this.props.onUpdateRouter(node, type, previousAction);
    }

    private updateSwitchRouter(kases: CaseElementProps[]): void {
        if (
            this.props.definition.localization &&
            Object.keys(this.props.definition.localization).length
        ) {
            this.cleanUpLocalizations(kases);
        }

        const { cases, exits, defaultExit } = resolveExits(kases, this.props.node);

        const optionalRouter: Pick<Router, 'result_name'> = {};
        if (this.state.resultName) {
            optionalRouter.result_name = this.state.resultName;
        }

        const optionalNode: Pick<Node, 'wait'> = {};
        if (this.state.config.type === 'wait_for_response') {
            optionalNode.wait = { type: WaitType.msg };
        } else if (this.state.config.type === 'split_by_expression') {
            optionalNode.wait = { type: WaitType.exp };
        }

        const router: SwitchRouter = {
            type: 'switch',
            default_exit_uuid: defaultExit,
            cases,
            operand: this.state.operand,
            ...optionalRouter
        };

        this.updateRouter(
            {
                uuid: this.props.node.uuid,
                router,
                exits,
                ...optionalNode
            },
            this.state.config.type,
            getAction(this.props, this.state.config)
        );
    }

    private updateGroupRouter(): void {
        const { state: { groups } } = this.widgets.Group;

        const currentCases = groupsToCases(groups);

        const { cases, exits, defaultExit } = resolveExits(currentCases, this.props.node);

        if (
            this.props.definition.localization &&
            Object.keys(this.props.definition.localization).length
        ) {
            this.cleanUpLocalizations(currentCases);
        }

        const router: Partial<SwitchRouter> = {
            type: 'switch',
            cases,
            default_exit_uuid: defaultExit,
            operand: GROUPS_OPERAND,
            result_name: ''
        };

        const updates: Partial<Node> = {
            uuid: this.props.node.uuid,
            exits,
            wait: {
                type: WaitType.group
            }
        };

        if (this.state.resultName) {
            router.result_name += this.state.resultName;
        }

        this.updateRouter(
            { ...updates, router } as Node,
            'split_by_group',
            getAction(this.props, this.state.config)
        );
    }

    private updateSubflowRouter(): void {
        const action = getAction(this.props, this.state.config);
        const select = this.widgets.Flow;
        const { name: flowName, id: flowUUID } = select.state.flow;

        const newAction: StartFlow = {
            uuid: action.uuid,
            type: this.state.config.type,
            flow_name: flowName,
            flow_uuid: flowUUID
        };

        // If we're already a subflow, lean on those exits and cases
        let exits: Exit[];
        let cases: Case[];

        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        if (details && details.type === 'subflow') {
            ({ exits } = this.props.node);
            ({ cases } = this.props.node.router as SwitchRouter);
        } else {
            // Otherwise, let's create some new ones
            exits = [
                {
                    uuid: generateUUID(),
                    name: 'Complete',
                    destination_node_uuid: null
                }
            ];

            cases = [
                {
                    uuid: generateUUID(),
                    type: 'has_run_status',
                    arguments: ['C'],
                    exit_uuid: exits[0].uuid
                }
            ];
        }

        const newRouter: SwitchRouter = {
            type: 'switch',
            operand: '@child',
            cases,
            default_exit_uuid: null
        };

        // HACK: this should go away with modal refactor
        let { uuid: nodeUUID } = this.props.node;

        if (action.uuid === nodeUUID) {
            nodeUUID = generateUUID();
        }

        this.updateRouter(
            {
                uuid: nodeUUID,
                router: newRouter,
                exits,
                actions: [newAction],
                wait: { type: 'flow', flow_uuid: flowUUID }
            },
            'subflow',
            action
        );
    }

    private updateWebhookRouter(): void {
        const action = getAction(this.props, this.state.config);
        const urlEle = this.widgets.URL;

        // Determine method
        let method: Methods = Methods.GET;
        const methodEle = this.widgets.MethodMap;
        if (methodEle.state.value) {
            method = methodEle.state.value;
        }

        // Determine body
        let body = DEFAULT_BODY;
        if (method === Methods.POST || method === Methods.PUT) {
            const bodyEle = this.widgets.Body;
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

        const { uuid } = action;
        const newAction: CallWebhook = {
            uuid,
            type: this.state.config.type,
            url: urlEle.state.value,
            headers,
            method,
            body
        };

        const exits: Exit[] = [];
        const cases: Case[] = [];
        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        // If we were already a webhook, lean on those exits and cases
        if (details && details.type === 'webhook') {
            this.props.node.exits.forEach(exit => exits.push(exit));
            (this.props.node.router as SwitchRouter).cases.forEach(kase => cases.push(kase));
        } else {
            // Otherwise, let's create some new ones
            exits.push(
                {
                    uuid: generateUUID(),
                    name: 'Success',
                    destination_node_uuid: null
                },
                {
                    uuid: generateUUID(),
                    name: 'Failure',
                    destination_node_uuid: null
                }
            );

            cases.push({
                uuid: generateUUID(),
                type: 'has_webhook_status',
                arguments: ['S'],
                exit_uuid: exits[0].uuid
            });
        }

        const router: SwitchRouter = {
            type: 'switch',
            operand: '@webhook',
            cases,
            default_exit_uuid: exits[1].uuid
        };

        // HACK: this should go away with modal <refactor></refactor>
        const nodeUUID: string =
            action.uuid === this.props.node.uuid ? generateUUID() : this.props.node.uuid;

        this.updateRouter(
            {
                uuid: nodeUUID,
                router,
                exits,
                actions: [newAction]
            },
            'webhook',
            action
        );
    }

    private getMode(): Mode {
        if (this.props.translating) {
            return Mode.TRANSLATING;
        }

        return Mode.EDITING;
    }

    private hasAdvanced(): boolean {
        const mode: Mode = this.getMode();

        return this.state.config.allows(mode);
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

        return this.state.config.name;
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

            if (isSwitchForm(this.state.config.type)) {
                ({ type_chooser_switch: className } = formStyles);
            } else {
                ({ type_chooser: className } = formStyles);
            }

            return (
                <TypeList
                    __className={className}
                    // NodeEditor
                    initialType={this.state.config}
                    onChange={this.onTypeChange}
                />
            );
        }

        return null;
    }

    private getSides(): Sides {
        const action = getAction(this.props, this.state.config);

        let updateRouter: Function;

        if (
            this.state.config.type === 'wait_for_response' ||
            this.state.config.type === 'split_by_expression'
        ) {
            updateRouter = this.updateSwitchRouter;
        } else if (this.state.config.type === 'start_flow') {
            updateRouter = this.updateSubflowRouter;
        } else if (this.state.config.type === 'call_webhook') {
            updateRouter = this.updateWebhookRouter;
        } else if (this.state.config.type === 'split_by_group') {
            updateRouter = this.updateGroupRouter;
        }

        const formProps: Partial<FormProps> = {
            // Node
            node: this.props.node,
            operand: this.state.operand,
            language: this.props.language,
            translating: this.props.translating,
            definition: this.props.definition,
            ComponentMap: this.props.ComponentMap,
            config: this.state.config,
            action,
            localizations: this.props.localizations,
            saveLocalizations: this.saveLocalizations,
            updateLocalizations: this.updateLocalizations,
            cleanUpLocalizations: this.cleanUpLocalizations,
            updateAction: this.updateAction,
            updateRouter,
            // NodeEditor
            getLocalizedObject: this.getLocalizedObject,
            getResultNameField: this.getResultNameField,
            getExitTranslations: this.getExitTranslations,
            onBindWidget: this.onBindWidget,
            onBindAdvancedWidget: this.onBindAdvancedWidget,
            onToggleAdvanced: this.toggleAdvanced,
            onExpressionChanged: this.onExpressionChanged,
            triggerFormUpdate: this.triggerFormUpdate,
            removeWidget: this.removeWidget
        };

        const { config: { form: FormComp } }: NodeEditorState = this.state;

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
                    __className={formStyles.advanced}>
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
        if (this.state.show) {
            if (this.state.config.form) {
                const style = shared[this.state.config.type];
                const titles: JSX.Element[] = this.getTitles();
                const buttons: ButtonSet = this.getButtons();
                const { front, back }: Sides = this.getSides();

                return (
                    <Modal
                        ref={this.modalRef}
                        __className={style}
                        width="600px"
                        title={titles}
                        show={this.state.show}
                        buttons={buttons}
                        node={this.props.node}>
                        {front}
                        {back}
                    </Modal>
                );
            }

            return null;
        }

        return null;
    }
}
