import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import Modal, { ButtonSet } from '../Modal';
import {
    FlowDefinition,
    Action,
    AnyAction,
    Router,
    SwitchRouter,
    Exit,
    Node,
    UINode
} from '../../flowTypes';
import {
    Type,
    Operator,
    Mode,
    GetTypeConfig,
    GetOperatorConfig,
    Endpoints
} from '../../services/EditorConfig';
import { Language } from '../LanguageSelector';
import { ReplyFormProps } from '../actions/Reply/ReplyForm';
import { ChangeGroupFormProps } from '../actions/ChangeGroup/ChangeGroupForm';
import { SaveFlowResultFormProps } from '../actions/SaveFlowResult/SaveFlowResultForm';
import { SendEmailFormProps } from '../actions/SendEmail/SendEmailForm';
import { SaveToContactFormProps } from '../actions/SaveToContact/SaveToContactForm';
import { SubflowRouterFormProps } from '../routers/SubflowRouter';
import { SwitchRouterFormProps } from '../routers/SwitchRouter';
import { WebhookRouterFormProps } from '../routers/WebhookRouter';
import ComponentMap from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import TypeListComp from './TypeList';
import TextInputElement from '../form/TextInputElement';

const formStyles = require('./NodeEditor.scss');
const shared = require('../shared.scss');

export type AnyFormProps =
    | ReplyFormProps
    | ChangeGroupFormProps
    | SaveFlowResultFormProps
    | SendEmailFormProps
    | SaveToContactFormProps
    | SubflowRouterFormProps
    | SwitchRouterFormProps
    | WebhookRouterFormProps;

export interface FormProps {
    showAdvanced: boolean;

    node: Node;
    translating: boolean;
    iso: string;
    action: AnyAction;
    localizations?: LocalizedObject[];
    definition: FlowDefinition;

    config: Type;

    ComponentMap: ComponentMap;

    updateAction(action: AnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    removeWidget(name: string): void;
    renderExitTranslations(): JSX.Element;

    operatorConfigList: Operator[];
    getOperatorConfig: GetOperatorConfig;
    endpoints: Endpoints;

    triggerFormUpdate(): void;
    onToggleAdvanced(): void;
    getLocalizedObject: Function;
    getLocalizedExits(widgets: { [name: string]: any }): { uuid: string; translations: any }[];
    saveLocalizedExits(widgets: { [name: string]: any }): void;
    getActionUUID: Function;
}

export interface NodeEditorProps {
    node: Node;
    iso: string;
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
    /** Perform when editor is closed */
    onClose?(canceled: boolean): void;

    typeConfigList: Type[];
    operatorConfigList: Operator[];
    getTypeConfig: GetTypeConfig;
    getOperatorConfig: GetOperatorConfig;
    endpoints: Endpoints;

    ComponentMap: ComponentMap;
}

export interface NodeEditorState {
    config: Type;
    show: boolean;
}

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

        this.state = {
            show: this.props.show || false,
            config: this.props.getTypeConfig(this.determineConfigType())
        };

        this.initialButtons = {
            primary: { name: 'Save', onClick: this.onSave.bind(this) },
            secondary: { name: 'Cancel', onClick: this.onCancel.bind(this) }
        };
        this.widgets = {};
        this.advancedWidgets = {};

        this.formRef = this.formRef.bind(this);
        this.advancedRef = this.advancedRef.bind(this);
        this.modalRef = this.modalRef.bind(this);
        this.getLocalizedObject = this.getLocalizedObject.bind(this);
        this.getActionUUID = this.getActionUUID.bind(this);
        this.renderExitTranslations = this.renderExitTranslations.bind(this);
        this.getLocalizedExits = this.getLocalizedExits.bind(this);
        this.saveLocalizedExits = this.saveLocalizedExits.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onBindWidget = this.onBindWidget.bind(this);
        this.onBindAdvancedWidget = this.onBindAdvancedWidget.bind(this);
        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.triggerFormUpdate = this.triggerFormUpdate.bind(this);
        this.removeWidget = this.removeWidget.bind(this);
    }

    private formRef(ref: any): void {
        return (this.form = ref);
    }

    private advancedRef(ref: any): void {
        return (this.advanced = ref);
    }

    private modalRef(ref: any): void {
        return (this.modal = ref);
    }

    private determineConfigType(): string {
        if (this.props.action) {
            return this.props.action.type;
        } else {
            if (this.props.nodeUI) {
                if (this.props.nodeUI.type) return this.props.nodeUI.type;
            }
        }

        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        if (details.type) {
            return details.type;
        }

        if (this.props.node) {
            if (this.props.node.router) {
                return this.props.node.router.type;
            }
        }

        throw new Error(
            `Cannot initialize NodeEditor without a valid type: ${this.props.node.uuid}`
        );
    }

    private getLocalizedObject() {
        if (this.props.localizations && this.props.localizations.length) {
            return this.props.localizations[0];
        }
    }

    private getActionUUID(): string {
        if (this.props.action) {
            if (this.props.action.uuid) {
                return this.props.action.uuid;
            }
            return generateUUID();
        }
        return generateUUID();
    }

    private renderExitTranslations(): JSX.Element {
        let exits: JSX.Element[] = [];
        let language: Language;

        if (this.props.localizations.length > 0) {
            language = this.props.localizations[0].getLanguage();
        }

        if (!language) {
            return null;
        }

        this.props.node.exits.forEach((exit: Exit) => {
            const localized = this.props.localizations.find(
                (localizedObject: LocalizedObject) => localizedObject.getObject().uuid === exit.uuid
            );

            if (localized) {
                let value;

                if ('name' in localized.localizedKeys) {
                    let localizedExit: Exit = localized.getObject();
                    value = localizedExit.name;
                }

                exits = [
                    ...exits,
                    <div key={`translate_${exit.uuid}`} className={formStyles.translating_exit}>
                        <div className={formStyles.translating_from}>{exit.name}</div>
                        <div className={formStyles.translating_to}>
                            <TextInputElement
                                ref={this.onBindWidget}
                                name={exit.uuid}
                                placeholder={`${language.name} Translation`}
                                showLabel={false}
                                value={value}
                                /** Node */
                                ComponentMap={this.props.ComponentMap}
                            />
                        </div>
                    </div>
                ];
            }
        });

        return (
            <div>
                <div className={formStyles.title}>Categories</div>
                <div className={formStyles.instructions}>
                    When category names are referenced later in the flow, the appropriate language
                    for the category will be used. If no translation is provided, the original text
                    will be used.
                </div>
                <div className={formStyles.translating_exits}>{exits}</div>
            </div>
        );
    }

    private getLocalizedExits(widgets: {
        [name: string]: any;
    }): { uuid: string; translations: any }[] {
        let results: { uuid: string; translations: any }[] = [];

        const { exits } = this.props.node;

        exits.forEach(({ uuid: exitUUID }: Exit) => {
            const input = widgets[exitUUID] as TextInputElement;

            if (input) {
                const value = input.state.value.trim();

                if (value) {
                    results = [...results, { uuid: exitUUID, translations: { name: [value] } }];
                } else {
                    results = [...results, { uuid: exitUUID, translations: null }];
                }
            }
        });

        return results;
    }

    private saveLocalizedExits(widgets: { [name: string]: any }): void {
        const exits = this.getLocalizedExits(widgets);
        const language = this.props.localizations[0].getLanguage().iso;
        this.props.onUpdateLocalizations(language, exits);
    }

    /** Make NodeEditor aware of base form inputs */
    public onBindWidget(widget: any): void {
        if (widget) {
            if (this.widgets) {
                this.widgets[widget.props.name] = widget;
            }
        }
    }

    /** Make NodeEditor aware of advanced form inputs */
    public onBindAdvancedWidget(widget: any): void {
        if (widget) {
            this.onBindWidget(widget);
            this.advancedWidgets[widget.props.name] = true;
        }
    }

    public submit(): boolean {
        let invalid: any[] = [];

        Object.keys(this.widgets).forEach(key => {
            const widget = this.widgets[key];
            if (!widget.validate()) {
                invalid = [...invalid, widget];
            }
        });

        /** If all form inputs are valid, submit it */
        if (invalid.length === 0) {
            if (this.form.onValid) {
                this.form.onValid(this.widgets);
            } else {
                /** Reach into wrapped components, e.g. that which is exported from SwitchRouter */
                this.form.getDecoratedComponentInstance().onValid(this.widgets);
            }
            return true;
        } else {
            let frontError = false;
            for (const widget of invalid) {
                if (!this.advancedWidgets.hasOwnProperty(widget.props.name)) {
                    frontError = true;
                    break;
                }
            }

            /** Show the right pane for the error */
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
        this.setState({
            show: true,
            config: this.props.getTypeConfig(this.determineConfigType())
        });
    }

    public close(canceled: boolean): void {
        this.widgets = {};
        this.advancedWidgets = {};

        this.setState(
            {
                show: false
            },
            () => {
                this.props.onClose(canceled);
            }
        );
    }

    private onOpen(): void {}

    private onSave(): void {
        if (this.submit()) {
            this.close(false);
        }
    }

    private onCancel(): void {
        this.close(true);
    }

    private triggerFormUpdate(): void {
        this.form.onUpdateForm(this.widgets);
        if (this.advanced) {
            this.advanced.onUpdateForm(this.widgets);
        }
    }

    /** Allow return key to submit our form */
    private onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void {
        /** Return key */
        if (event.which === 13) {
            var isTextarea = $(event.target).prop('tagName') == 'TEXTAREA';
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

    private toggleAdvanced(): void {
        if (this.modal) {
            this.modal.toggleFlip();
        }
    }

    private removeWidget(name: string): void {
        delete this.widgets[name];
    }

    private getMode(): Mode {
        let mode: Mode;

        if (this.props.translating) {
            mode = Mode.TRANSLATING;
        } else {
            mode = Mode.EDITING;
        }

        return mode;
    }

    private hasAdvanced(): boolean {
        const mode: Mode = this.getMode();

        return this.state.config.allows(mode);
    }

    private getModalKey(): string {
        let key: string = `modal_${this.props.node.uuid}`;

        if (this.props.action) {
            key += `_${this.props.action.uuid}`;
        }

        return key;
    }

    private getButtons(): ButtonSet {
        let buttons: ButtonSet;

        if (this.temporaryButtons) {
            buttons = this.temporaryButtons;
        } else {
            buttons = this.initialButtons;
        }

        return buttons;
    }

    private getTitleText(): string {
        let titleText: string = this.state.config.name;

        if (this.props.localizations && this.props.localizations.length > 0) {
            titleText = `${this.props.localizations[0].getLanguage().name} Translation`;
        }

        return titleText;
    }

    private getTitles(): JSX.Element[] {
        const titleText: string = this.getTitleText();
        let titles: JSX.Element[] = [<div>{titleText}</div>];

        if (this.hasAdvanced()) {
            titles = [
                ...titles,
                <div>
                    <div>{titleText}</div>
                    <div className={shared.advanced_title}>Advanced Settings</div>
                </div>
            ];
        }

        return titles;
    }

    private getTypeList(): JSX.Element {
        let typeList: JSX.Element = null;

        if (!this.props.localizations || !this.props.localizations.length) {
            typeList = (
                <TypeListComp
                    className={formStyles.type_chooser}
                    /** NodeEditor */
                    initialType={this.state.config}
                    onChange={this.onTypeChange}
                    /** Node */
                    typeConfigList={this.props.typeConfigList}
                />
            );
        }

        return typeList;
    }

    private getSides(): { front: JSX.Element; back: JSX.Element } {
        const formProps = {
            /** Node */
            node: this.props.node,
            iso: this.props.iso,
            translating: this.props.translating,
            definition: this.props.definition,
            operatorConfigList: this.props.operatorConfigList,
            typeConfigList: this.props.typeConfigList,
            getTypeConfig: this.props.getTypeConfig,
            getOperatorConfig: this.props.getOperatorConfig,
            endpoints: this.props.endpoints,
            ComponentMap: this.props.ComponentMap,
            config: this.state.config,
            action: this.props.action,
            localizations: this.props.localizations,
            updateLocalizations: (
                language: string,
                changes: { uuid: string; translations: any }[]
            ) => {
                this.props.onUpdateLocalizations(language, changes);
            },
            updateAction: (action: Action) => {
                this.props.onUpdateAction(this.props.node, action);
            },
            updateRouter: (node: Node, type: string, previousAction?: Action) => {
                this.props.onUpdateRouter(node, type, previousAction);
            },
            /** NodeEditor */
            onTypeChange: this.onTypeChange,
            getLocalizedExits: this.getLocalizedExits,
            getLocalizedObject: this.getLocalizedObject,
            saveLocalizedExits: this.saveLocalizedExits,
            getActionUUID: this.getActionUUID,
            renderExitTranslations: this.renderExitTranslations,
            onBindWidget: this.onBindWidget,
            onBindAdvancedWidget: this.onBindAdvancedWidget,
            onToggleAdvanced: this.toggleAdvanced,
            onKeyPress: this.onKeyPress,
            triggerFormUpdate: this.triggerFormUpdate,
            removeWidget: this.removeWidget
        };

        const FormWrapper: React.SFC<{ styles?: string }> = ({ children, styles }) => (
            <div className={styles ? styles : null}>
                <div className={formStyles.node_editor}>
                    <form onKeyPress={this.onKeyPress}>{children}</form>
                </div>
            </div>
        );

        const { config: { form: Form } }: NodeEditorState = this.state;
        const typeList = this.getTypeList();

        const front = (
            <FormWrapper>
                {typeList}
                <Form ref={this.formRef} {...{ ...formProps, showAdvanced: false }} />
            </FormWrapper>
        );

        let back: JSX.Element = null;

        if (this.hasAdvanced()) {
            back = (
                <FormWrapper styles={formStyles.advanced}>
                    <Form ref={this.formRef} {...{ ...formProps, showAdvanced: true }} />
                </FormWrapper>
            );
        }

        return {
            front,
            back
        };
    }

    public render(): JSX.Element {
        if (this.state.show) {
            /** Create our form element */
            if (this.state.config.form) {
                const key: string = this.getModalKey();
                const buttons: ButtonSet = this.getButtons();
                const titles: JSX.Element[] = this.getTitles();
                const { front, back }: { front: JSX.Element; back: JSX.Element } = this.getSides();

                return (
                    <Modal
                        key={key}
                        ref={this.modalRef}
                        /** NodeEditor */
                        className={shared[this.state.config.type]}
                        width="600px"
                        title={titles}
                        show={this.state.show}
                        buttons={buttons}
                        onModalOpen={this.onOpen}
                        /** Node */
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
