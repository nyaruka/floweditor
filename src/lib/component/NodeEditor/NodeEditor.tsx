import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { substArr } from '@ycleptkellan/substantive';
import { v4 as generateUUID } from 'uuid';
import Modal, { ButtonSet } from '../Modal';
import {
    Endpoints,
    FlowDefinition,
    Action,
    AnyAction,
    Router,
    SwitchRouter,
    Exit,
    Node,
    UINode,
    Reply,
    ChangeGroup,
    SaveToContact,
    SendEmail,
    SaveFlowResult,
    CallWebhook,
    StartFlow
} from '../../flowTypes';
import { Type, Mode, getTypeConfig } from '../../config';
import { Language } from '../LanguageSelector';
import { ReplyFormProps } from '../actions/Reply/ReplyForm';
import ComponentMap, { ComponentDetails } from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import TypeList from './TypeList';
import FormContainer from './FormContainer';
import TextInputElement from '../form/TextInputElement';

import * as formStyles from './NodeEditor.scss';
import * as shared from '../shared.scss';

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
    updateAction: Function;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations: Function;
    updateRouter: Function;
    removeWidget(name: string): void;
    getExitTranslations(): JSX.Element;
    triggerFormUpdate(): void;
    onToggleAdvanced(): void;
    getLocalizedObject: Function;
    getLocalizedExits(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }>;
    saveLocalizedExits(widgets: { [name: string]: any }): void;
}

interface Sides {
    front: JSX.Element;
    back: JSX.Element;
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
    /** Perform when editor is closed */
    onClose?(canceled: boolean): void;
    ComponentMap: ComponentMap;
}

export interface NodeEditorState {
    config: Type;
    show: boolean;
}

export default class NodeEditor extends React.PureComponent<
    NodeEditorProps,
    NodeEditorState
> {
    private modal: Modal;
    private form: any;
    private advanced: any;
    private widgets: { [name: string]: any } = {};
    private advancedWidgets: { [name: string]: boolean } = {};
    private initialButtons: ButtonSet;
    private temporaryButtons?: ButtonSet;


    constructor(props: NodeEditorProps) {
        super(props);

        const show = this.props.show || false;
        const type = this.determineConfigType();
        const config = getTypeConfig(type);

        this.state = {
            show,
            config
        };

        bindCallbacks(this, {
            include: [
                'onFormRef',
                'onModalRef',
                'onSave',
                'onCancel',
                'onOpen',
                'onTypeChange',
                'onKeyPress',
                'onBindWidget',
                'onBindAdvancedWidget',
                'updateAction',
                'updateRouter',
                'updateLocalizations',
                'getLocalizedObject',
                'getExitTranslations',
                'getLocalizedExits',
                'saveLocalizedExits',
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

    private onFormRef(ref: React.Component<{}>): React.Component<{}> {
        return (this.form = ref);
    }

    private onModalRef(ref: Modal): Modal {
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

    private onOpen(): void {}

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

    private updateAction(action: Action): void {
        this.props.onUpdateAction(this.props.node, action);
    }

    private updateRouter(
        node: Node,
        type: string,
        previousAction?: Action
    ): void {
        this.props.onUpdateRouter(node, type, previousAction);
    }

    private updateLocalizations(
        language: string,
        changes: Array<{ uuid: string; translations: any }>
    ): void {
        this.props.onUpdateLocalizations(language, changes);
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

        const details: ComponentDetails = this.props.ComponentMap.getDetails(
            this.props.node.uuid
        );

        if (details.type) {
            return details.type;
        }

        throw new Error(
            `Cannot initialize NodeEditor without a valid type: ${
                this.props.node.uuid
            }`
        );
    }

    private getLocalizedObject(): LocalizedObject {
        if (substArr(this.props.localizations)) {
            return this.props.localizations[0];
        }
    }

    private getLocalizedExits(widgets: {
        [name: string]: any;
    }): Array<{ uuid: string; translations: any }> {
        return this.props.node.exits.reduce(
            (results, { uuid: exitUUID }: Exit) => {
                const input = widgets[exitUUID] as TextInputElement;

                if (input) {
                    // We save localized values as string arrays
                    const value =
                        input.state.value.constructor === Array
                            ? input.state.value[0].trim()
                            : input.state.value.trim();

                    if (value) {
                        results.push({
                            uuid: exitUUID,
                            translations: { name: [value] }
                        });
                    } else {
                        results.push({ uuid: exitUUID, translations: null });
                    }
                }

                return results;
            },
            []
        );
    }

    private saveLocalizedExits(widgets: { [name: string]: any }): void {
        const exits = this.getLocalizedExits(widgets);
        const { iso } = this.props.language;

        this.props.onUpdateLocalizations(iso, exits);
    }

    private getExitTranslations(): JSX.Element {
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
                        <div
                            key={exitUUID}
                            className={formStyles.translating_exit}>
                            <span
                                data-spec="exit-name"
                                className={formStyles.translating_from}>
                                {exitName}
                            </span>
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
            <>
                <span data-spec="title" className={formStyles.title}>
                    Categories
                </span>
                <span
                    data-spec="instructions"
                    className={formStyles.instructions}>
                    When category names are referenced later in the flow, the
                    appropriate language for the category will be used. If no
                    translation is provided, the original text will be used.
                </span>
                <div className={formStyles.translating_exits}>{exits}</div>
            </>
        );
    }

    public submit(): boolean {
        const invalid: any[] = Object.keys(this.widgets).reduce(
            (invalidList, key) => {
                const widget = this.widgets[key];

                if (!widget.validate()) {
                    invalidList.push(widget);
                }

                return invalidList;
            },
            []
        );

        // If all form inputs are valid, submit it
        if (!substArr(invalid)) {
            this.form.onValid(this.widgets);

            return true;
        } else {
            let frontError: boolean = false;

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
        const type = this.determineConfigType();
        const config = getTypeConfig(type);

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

    private hasAdvanced(): boolean {
        const mode: Mode = this.getMode();

        return this.state.config.allows(mode);
    }

    /**
     * Returns existing action (if any), or a bare-bones representation of the form's action.
     */
    private getAction(): AnyAction {
        if (this.props.action) {
            if (
                this.props.action.type === this.state.config.type ||
                (this.state.config.aliases &&
                    this.props.action.type === this.state.config.aliases[0])
            ) {
                return this.props.action;
            }
        }

        let action: Action = {
            type: this.state.config.type,
            uuid: generateUUID()
        };

        switch (this.state.config.type) {
            case 'reply':
                action = { ...action, text: '', all_urns: false } as Reply;
                break;
            case 'add_to_group':
                action = { ...action, groups: null } as ChangeGroup;
                break;
            case 'save_contact_field':
                action = {
                    ...action,
                    field_uuid: generateUUID(),
                    field_name: '',
                    value: ''
                } as SaveToContact;
                break;
            case 'send_email':
                action = {
                    ...action,
                    subject: '',
                    body: '',
                    emails: null
                } as SendEmail;
                break;
            case 'save_flow_result':
                action = {
                    ...action,
                    result_name: '',
                    value: '',
                    category: ''
                } as SaveFlowResult;
                break;
            case 'call_webhook':
                action = { ...action, url: '', method: 'GET' } as CallWebhook;
                break;
            case 'start_flow':
                action = {
                    ...action,
                    flow_name: null,
                    flow_uuid: null
                } as StartFlow;
                break;
        }

        return action;
    }

    private getMode(): Mode {
        if (this.props.translating) {
            return Mode.TRANSLATING;
        }

        return Mode.EDITING;
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
        const titles: JSX.Element[] = [<React.Fragment key='front'>{titleText}</React.Fragment>];

        if (this.hasAdvanced()) {
            titles.push(
                <React.Fragment key='advanced'>
                    <span>{titleText}</span>
                    <span className={shared.advanced_title}>
                        Advanced Settings
                    </span>
                </React.Fragment>
            );
        }

        return titles;
    }

    private getTypeList(): JSX.Element {
        if (!this.props.translating) {
            let className: string = '';

            if (
                this.state.config.type === 'wait_for_response' ||
                this.state.config.type === 'expression' ||
                this.state.config.type === 'group'
            ) {
                ({ type_chooser_switch: className } = formStyles);
            } else {
                ({ type_chooser: className } = formStyles);
            }

            return (
                <TypeList
                    __className={className}
                    initialType={this.state.config}
                    onChange={this.onTypeChange}
                />
            );
        }

        return null;
    }

    private getSides(): Sides {
        const action: AnyAction = this.getAction();

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
            updateLocalizations: this.updateLocalizations,
            updateAction: this.updateAction,
            updateRouter: this.updateRouter,
            // NodeEditor
            getLocalizedExits: this.getLocalizedExits,
            getLocalizedObject: this.getLocalizedObject,
            saveLocalizedExits: this.saveLocalizedExits,
            getExitTranslations: this.getExitTranslations,
            onBindWidget: this.onBindWidget,
            onBindAdvancedWidget: this.onBindAdvancedWidget,
            onToggleAdvanced: this.toggleAdvanced,
            triggerFormUpdate: this.triggerFormUpdate,
            removeWidget: this.removeWidget
        };

        const { config: { form: FormComp } }: NodeEditorState = this.state;

        const typeList: JSX.Element = this.getTypeList();

        const front: JSX.Element = (
            <FormContainer key={'fc-front'} onKeyPress={this.onKeyPress}>
                {typeList}
                <FormComp
                    ref={this.onFormRef}
                    {...{ ...formProps, showAdvanced: false }}
                />
            </FormContainer>
        );

        let back: JSX.Element = null;

        if (this.hasAdvanced()) {
            back = (
                <FormContainer
                    key={'fc-back'}
                    onKeyPress={this.onKeyPress}
                    styles={formStyles.advanced}>
                    <FormComp
                        ref={this.onFormRef}
                        {...{ ...formProps, showAdvanced: true }}
                    />
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
                const style: string = shared[this.state.config.type];
                const titles: JSX.Element[] = this.getTitles();
                const buttons: ButtonSet = this.getButtons();
                const { front, back }: Sides = this.getSides();

                return (
                    <Modal
                        ref={this.onModalRef}
                        // NodeEditor
                        __className={style}
                        width="600px"
                        title={titles}
                        show={this.state.show}
                        buttons={buttons}
                        onModalOpen={this.onOpen}
                        // Node
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
