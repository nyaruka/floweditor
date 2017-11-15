import * as React from 'react';
import Modal, { ButtonSet } from '../Modal';
import { Action, Node, UINode } from '../../flowTypes';
import {
    Type,
    Operator,
    Mode,
    GetTypeConfig,
    GetOperatorConfig,
    Endpoints
} from '../../services/EditorConfig';
import ComponentMap from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import NodeEditorFormComp, { NodeEditorFormProps } from './NodeEditorForm';

const formStyles = require('./NodeEditor.scss');
const shared = require('../shared.scss');

export interface NodeEditorProps {
    node: Node;
    action?: Action;
    nodeUI?: UINode;
    actionsOnly?: boolean;
    localizations?: LocalizedObject[];

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
            show: false,
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
        this.onOpen = this.onOpen.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onBindWidget = this.onBindWidget.bind(this);
        this.onBindAdvancedWidget = this.onBindAdvancedWidget.bind(this);
        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.triggerFormUpdate = this.triggerFormUpdate.bind(this);
        this.removeWidget = this.removeWidget.bind(this);
        this.isTranslating = this.isTranslating.bind(this);
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
        if (this.props.hasOwnProperty('action') && this.props.action) {
            return this.props.action.type;
        } else {
            if (this.props.hasOwnProperty('nodeUI') && this.props.nodeUI) {
                if (this.props.nodeUI.hasOwnProperty('type') && this.props.nodeUI.type)
                    return this.props.nodeUI.type;
            }
        }

        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        if (details.hasOwnProperty('type') && details.type) {
            return details.type;
        }

        if (this.props.hasOwnProperty('node') && this.props.node) {
            if (this.props.node.hasOwnProperty('router') && this.props.node.router) {
                return this.props.node.router.type;
            }
        }

        throw new Error(
            `Cannot initialize NodeEditor without a valid type: ${this.props.node.uuid}`
        );
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
            this.form.onValid(this.widgets);
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

    private isTranslating(): boolean {
        return this.props.localizations && this.props.localizations.length > 0;
    }
    private getMode(): Mode {
        let mode: Mode;

        if (this.isTranslating()) {
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

    public render(): JSX.Element {
        if (this.state.show) {
            /** Create our form element */
            if (this.state.config.hasOwnProperty('form') && this.state.config.form) {
                const nodeEditorProps = {
                    isTranslating: this.isTranslating(),
                    typeConfigList: this.props.typeConfigList,
                    operatorConfigList: this.props.operatorConfigList,
                    getTypeConfig: this.props.getTypeConfig,
                    getOperatorConfig: this.props.getOperatorConfig,
                    endpoints: this.props.endpoints,
                    ComponentMap: this.props.ComponentMap,
                    config: this.state.config,
                    node: this.props.node,
                    action: this.props.action,
                    onTypeChange: this.onTypeChange,
                    localizations: this.props.localizations,
                    onBindWidget: this.onBindWidget,
                    onBindAdvancedWidget: this.onBindAdvancedWidget,
                    onToggleAdvanced: this.toggleAdvanced,
                    onKeyPress: this.onKeyPress,
                    triggerFormUpdate: this.triggerFormUpdate,
                    removeWidget: this.removeWidget,
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
                    }
                };

                const { config: { form: Form } }: NodeEditorState = this.state;

                const front = (
                    <NodeEditorFormComp
                        ref={this.formRef}
                        {...{ ...nodeEditorProps, advanced: false }}>
                        {formProps => <Form {...formProps} />}
                    </NodeEditorFormComp>
                );

                let back: JSX.Element = null;

                if (this.hasAdvanced()) {
                    back = (
                        <NodeEditorFormComp
                            ref={this.advancedRef}
                            {...{ ...nodeEditorProps, advanced: true }}>
                            {formProps => <Form {...formProps} />}
                        </NodeEditorFormComp>
                    );
                }

                const key: string = this.getModalKey();
                const buttons: ButtonSet = this.getButtons();
                const titles = this.getTitles();

                return (
                    <Modal
                        key={key}
                        ref={this.modalRef}
                        className={shared[this.state.config.type]}
                        width="600px"
                        title={titles}
                        show={this.state.show}
                        buttons={buttons}
                        onModalOpen={this.onOpen}>
                        {front}
                        {back}
                    </Modal>
                );
            }
        }
        return null;
    }
}
