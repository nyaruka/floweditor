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
    Methods
} from '../../flowTypes';
import { Type, Mode } from '../../providers/ConfigProvider/typeConfigs';
import { Language } from '../LanguageSelector';
import ComponentMap from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import TypeList from './TypeList';
import TextInputElement from '../form/TextInputElement';
import { CaseElementProps } from '../form/CaseElement';
import { getTypeConfigPT, getOperatorConfigPT } from '../../providers/ConfigProvider/propTypes';
import { LocalizationUpdates } from '../../services/FlowMutator';
import { ConfigProviderContext } from '../../providers/ConfigProvider/configContext';

import * as formStyles from './NodeEditor.scss';
import * as shared from '../shared.scss';

export type GetResultNameField = () => JSX.Element;
export type SaveLocalizations = (
    widgets: { [name: string]: any },
    cases?: CaseElementProps[]
) => void;
export type CleanUpLocalizations = (cases: CaseElementProps[]) => void;

interface Sides {
    front: JSX.Element;
    back: JSX.Element;
}

export interface FormProps {
    showAdvanced: boolean;
    node: Node;
    translating: boolean;
    language: Language;
    action?: AnyAction;
    localizations?: LocalizedObject[];
    definition: FlowDefinition;
    config: Type;
    ComponentMap: ComponentMap;
    updateAction(action: AnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    removeWidget(name: string): void;
    getExitTranslations(): JSX.Element;
    triggerFormUpdate(): void;
    onToggleAdvanced(): void;
    getLocalizedObject: Function;
    cleanUpLocalizations: CleanUpLocalizations;
    saveLocalizations: SaveLocalizations;
    getResultNameField: GetResultNameField;
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
    setResultName: boolean;
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

    public static contextTypes = {
        getTypeConfig: getTypeConfigPT,
        getOperatorConfig: getOperatorConfigPT
    };

    constructor(props: NodeEditorProps, context: ConfigProviderContext) {
        super(props, context);

        this.state = this.getInitialState();

        bindCallbacks(this, {
            include: [
                'onSave',
                'onCancel',
                'onTypeChange',
                'onKeyPress',
                'onBindWidget',
                'onBindAdvancedWidget',
                'onShowNameField',
                'formRef',
                'modalRef',
                'getLocalizedObject',
                'getExitTranslations',
                'getResultNameField',
                'getLocalizedObject',
                'updateAction',
                'updateRouter',
                'saveLocalizations',
                'cleanUpLocalizations',
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
            setResultName: true
        });
    }

    private determineConfigType(): string {
        if (this.props.action) {
            return this.props.action.type;
        } else {
            if (this.props.nodeUI) {
                if (this.props.nodeUI.type) {
                    return this.props.nodeUI.type;
                }
            }
        }

        // Account for ghost nodes
        if (this.props.node) {
            if (this.props.node.router) {
                return this.props.node.router.type;
            }

            if (this.props.node.actions) {
                return this.props.node.actions[0].type;
            }
        }

        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        if (details.type) {
            return details.type;
        }

        throw new Error(
            `Cannot initialize NodeEditor without a valid type: ${this.props.node.uuid}`
        );
    }

    private getInitialState(): NodeEditorState {
        const type = this.determineConfigType();
        const config = this.context.getTypeConfig(type);
        const show = this.props.show || false;
        const setResultName =
            this.props.node.router && this.props.node.router.result_name ? true : false;

        return {
            config,
            show,
            setResultName
        };
    }

    private getLocalizedObject(): LocalizedObject {
        if (this.props.localizations && this.props.localizations.length) {
            return this.props.localizations[0];
        }
    }

    private getResultNameField(): JSX.Element {
        let nameField: JSX.Element;

        if (this.state.setResultName) {
            let resultName = '';

            if (
                (this.props.node.router as SwitchRouter) &&
                (this.props.node.router as SwitchRouter).result_name
            ) {
                resultName += (this.props.node.router as SwitchRouter).result_name;
            }

            nameField = (
                <TextInputElement
                    data-spec="name-field"
                    ref={this.onBindWidget}
                    name="Result Name"
                    showLabel={true}
                    value={resultName}
                    helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
                    ComponentMap={this.props.ComponentMap}
                    config={this.state.config}
                />
            );
        } else {
            nameField = (
                <span
                    data-spec="name-field"
                    className={formStyles.saveLink}
                    onClick={this.onShowNameField}>
                    Save as..
                </span>
            );
        }

        return <div className={formStyles.saveAs}>{nameField}</div>;
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
        const config = this.context.getTypeConfig(this.determineConfigType());

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
        const action: AnyAction = getAction(this.props, this.state.config);

        const formProps: Partial<FormProps> = {
            // Node
            node: this.props.node,
            language: this.props.language,
            translating: this.props.translating,
            definition: this.props.definition,
            ComponentMap: this.props.ComponentMap,
            config: this.state.config,
            action,
            localizations: this.props.localizations,
            saveLocalizations: this.saveLocalizations,
            cleanUpLocalizations: this.cleanUpLocalizations,
            updateAction: this.updateAction,
            updateRouter: this.updateRouter,
            // NodeEditor
            getLocalizedObject: this.getLocalizedObject,
            getResultNameField: this.getResultNameField,
            getExitTranslations: this.getExitTranslations,
            onBindWidget: this.onBindWidget,
            onBindAdvancedWidget: this.onBindAdvancedWidget,
            onToggleAdvanced: this.toggleAdvanced,
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
