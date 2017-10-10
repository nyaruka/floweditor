import * as React from "react";
import * as UUID from "uuid";
import { Modal, ButtonSet } from "./Modal";
import { Node, Router, Action, Reply, UINode, Exit } from "../FlowDefinition";
import { TypeConfig, Config, Mode } from "../services/Config";
import { ComponentMap } from "./ComponentMap";
import { TextInputElement } from "./form/TextInputElement";
import { FlowContext } from "./Flow";
import { FormWidget, FormValueState } from "./form/FormWidget";
import { FormElementProps } from "./form/FormElement";
import { ButtonProps } from "./Button";
import { LocalizedObject } from "../Localization";
import { Language } from "./LanguageSelector";

import Select from 'react-select';
// var Select = require('react-select');
var formStyles = require("./NodeEditor.scss");
var shared = require("./shared.scss");

export interface NodeEditorProps {
    node: Node;
    action?: Action;
    nodeUI?: UINode;
    actionsOnly: boolean;
    localizations?: LocalizedObject[];
    context: FlowContext;

    // actions to perform when we are closed
    onClose?(canceled: boolean): void;
}

export interface NodeEditorState {
    config: TypeConfig;
    show: boolean;
    initialButtons: ButtonSet;
    temporaryButtons?: ButtonSet;
}

function getType(props: NodeEditorProps) {
    var type: string;
    if (props.action) {
        return props.action.type
    } else {
        if (props.nodeUI && props.nodeUI.type) {
            return props.nodeUI.type;
        }
    }

    var details = ComponentMap.get().getDetails(props.node.uuid);
    if (details.type) {
        return details.type;
    }

    if (props.node.router) {
        return props.node.router.type
    }

    return null;
}

export class NodeEditor extends React.PureComponent<NodeEditorProps, NodeEditorState> {

    private modal: Modal;
    private form: NodeEditorForm<NodeEditorFormState>;
    private advanced: NodeEditorForm<NodeEditorFormState>;
    private widgets: { [name: string]: Widget } = {};
    private advancedWidgets: { [name: string]: boolean } = {};

    constructor(props: NodeEditorProps) {
        super(props);

        this.onOpen = this.onOpen.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);

        this.onBindWidget = this.onBindWidget.bind(this);
        this.onBindAdvancedWidget = this.onBindAdvancedWidget.bind(this);

        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.triggerFormUpdate = this.triggerFormUpdate.bind(this);
        this.removeWidget = this.removeWidget.bind(this);

        // determine our initial config
        var type = getType(props);

        if (!type) {
            throw new Error("Cannot initialize NodeEditor without a valid type: " + this.props.node.uuid);
        }

        this.state = {
            show: false,
            config: Config.get().getTypeConfig(type),
            initialButtons: {
                primary: { name: "Save", onClick: this.onSave },
                secondary: { name: "Cancel", onClick: this.onCancel }
            }
        }
    }

    public onBindWidget(widget: Widget) {

        if (widget) {
            if (this.widgets) {
                this.widgets[widget.props.name] = widget;
            }
        }
    }

    public onBindAdvancedWidget(widget: Widget) {
        if (widget) {
            this.onBindWidget(widget);
            this.advancedWidgets[widget.props.name] = true;
        }
    }

    public submit(): boolean {

        var invalid: Widget[] = [];
        for (let key in this.widgets) {
            let widget = this.widgets[key];
            if (!widget.validate()) {
                invalid.push(widget);
            }
        }

        // if we are valid, submit it
        if (invalid.length == 0) {
            this.form.onValid(this.widgets)
            return true;
        } else {
            var frontError = false;
            for (let widget of invalid) {
                if (!this.advancedWidgets[widget.props.name]) {
                    frontError = true;
                    break;
                }
            }

            // show the right pane for our error
            if ((frontError && this.modal.state.flipped)
                || (!frontError && !this.modal.state.flipped)) {
                this.toggleAdvanced();
            }
        }

        return false;
    }


    getType(): string {
        var type: string;
        if (this.props.action) {
            type = this.props.action.type
        } else {
            var details = ComponentMap.get().getDetails(this.props.node.uuid);
            type = details.type;
        }
        return type;
    }

    open() {
        this.setState({
            show: true,
            config: Config.get().getTypeConfig(getType(this.props))
        });
    }

    close(canceled: boolean) {
        this.widgets = {};
        this.advancedWidgets = {};

        this.setState({
            show: false
        }, () => {
            this.props.onClose(canceled);
        })
    }

    onOpen() {
    };

    onSave() {
        if (this.submit()) {
            this.close(false);
        }
    }

    onCancel() {
        this.close(true);
    }

    private triggerFormUpdate() {
        this.form.onUpdateForm(this.widgets);
        if (this.advanced) {
            this.advanced.onUpdateForm(this.widgets);
        }
    }

    /**
    * Allow enter key to submit our form
    */
    private onKeyPress(event: React.KeyboardEvent<HTMLFormElement>) {
        // enter key
        if (event.which == 13) {
            var isTextarea = $(event.target).prop("tagName") == 'TEXTAREA'
            if (!isTextarea || event.shiftKey) {
                event.preventDefault();
                if (this.submit()) {
                    this.close(false);
                }
            }
        }
    }

    private onTypeChange(config: TypeConfig) {
        this.widgets = {};
        this.advancedWidgets = {};

        this.setState({
            config: config
        });
    }

    private toggleAdvanced() {
        if (this.modal) {
            this.modal.toggleFlip();
        }
    }

    private removeWidget(name: string) {
        delete this.widgets[name];
    }

    render() {

        var isTranslating = this.props.localizations && this.props.localizations.length > 0;
        var mode = Mode.EDITING;
        if (isTranslating) {
            mode = Mode.TRANSLATING;
        }

        this.widgets = {};
        this.advancedWidgets = {};

        var front: JSX.Element = null;
        var back: JSX.Element = null;


        if (this.state.show) {
            // create our form element
            if (this.state.config.form != null) {

                var formProps: NodeEditorFormProps = {
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

                    updateLocalizations: (language: string, changes: { uuid: string, translations: any }[]) => {
                        this.props.context.eventHandler.onUpdateLocalizations(language, changes);
                    },

                    updateAction: (action: Action) => {
                        this.props.context.eventHandler.onUpdateAction(this.props.node, action);
                    },

                    updateRouter: (node: Node, type: string, previousAction?: Action) => {
                        this.props.context.eventHandler.onUpdateRouter(node, type, previousAction);
                    }
                };

                front = React.createElement(this.state.config.form, { ref: (ele: any) => { this.form = ele; }, ...formProps });
                if (this.state.config.allows(mode)) {
                    back = React.createElement(this.state.config.form, { ref: (ref: any) => { this.advanced = ref }, advanced: true, ...formProps });
                }

            }
        }

        var key = 'modal_' + this.props.node.uuid;
        if (this.props.action) {
            key += '_' + this.props.action.uuid;
        }

        var buttons = this.state.initialButtons;
        if (this.state.temporaryButtons) {
            buttons = this.state.temporaryButtons;
        }

        var titleText = this.state.config.name;
        if (this.props.localizations && this.props.localizations.length > 0) {
            titleText = this.props.localizations[0].getLanguage().name + " Translation";
        }

        var titles: JSX.Element[] = [<div>{titleText}</div>]
        if (back) {
            titles.push(<div><div>{titleText}</div><div className={shared.advanced_title}>Advanced Settings</div></div>);
        }

        return (
            <Modal
                key={key}
                ref={(ref: any) => { this.modal = ref }}
                className={shared[this.state.config.type]}
                width="600px"
                title={titles}
                show={this.state.show}
                buttons={buttons}
                onModalOpen={this.onOpen}>
                {front}
                {back}
            </Modal>
        )
    }
}

export interface TypeChooserProps {
    className: string;
    initialType: TypeConfig;
    onChange(config: TypeConfig): void;
}

export interface TypeChooserState {
    config: TypeConfig;
}

class TypeChooser extends React.PureComponent<TypeChooserProps, TypeChooserState> {

    constructor(props: TypeChooserProps) {
        super(props);

        this.state = {
            config: this.props.initialType
        }
    }

    private onChangeType(config: TypeConfig) {
        this.setState({
            config: config
        }, () => {
            this.props.onChange(config);
        });
    }

    render() {
        var options: any = Config.get().typeConfigs;

        return (
            <div className={this.props.className}>
                <div className={formStyles.intro}>When a contact arrives at this point in your flow</div>
                <div>
                    <Select
                        value={this.state.config.type}
                        onChange={this.onChangeType.bind(this)}
                        valueKey="type"
                        searchable={false}
                        clearable={false}
                        labelKey="description"
                        options={options}
                    />
                </div>
            </div>
        )
    }
}

export abstract class Widget extends FormWidget<FormElementProps, FormValueState> { }

export interface NodeEditorFormProps {
    config: TypeConfig;
    node: Node;
    localizations?: LocalizedObject[];
    action?: Action;

    advanced?: boolean;

    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    onToggleAdvanced(): void;
    onKeyPress(event: React.KeyboardEvent<HTMLFormElement>): void;
    triggerFormUpdate(): void;
    removeWidget(name: string): void;

    onTypeChange(config: TypeConfig): void;
    updateLocalizations(language: string, changes: { uuid: string, translations: any }[]): void;
    updateAction(action: Action): void;
    updateRouter(node: Node, type: string, previousAction: Action): void;
}

export interface NodeEditorFormState { }

abstract class NodeEditorForm<S extends NodeEditorFormState> extends React.PureComponent<NodeEditorFormProps, S> {

    abstract onValid(widgets: { [name: string]: Widget }): void;
    abstract renderForm(ref: any): JSX.Element;

    /** Update our form according to current widget state, noop by default */
    public onUpdateForm(widgets: { [name: string]: Widget }) { }

    public isTranslating() {
        return this.props.localizations && this.props.localizations.length > 0;
    }

    public renderAdvanced(ref: any): JSX.Element {
        return null;
    }

    render() {

        var form: JSX.Element;
        var chooser = null;

        var classes = [formStyles.form];
        if (this.props.advanced) {
            form = this.renderAdvanced(this.props.onBindAdvancedWidget)
            classes.push(formStyles.advanced);
        } else {
            if (!this.props.localizations || this.props.localizations.length == 0) {
                chooser = <TypeChooser className={formStyles.type_chooser} initialType={this.props.config} onChange={this.props.onTypeChange} />
            }
            form = this.renderForm(this.props.onBindWidget)
        }

        if (!form) {
            return null;
        }

        return (
            <div className={classes.join(" ")}>
                <div className={formStyles.node_editor}>
                    <form onKeyPress={this.props.onKeyPress}>
                        {chooser}
                        {form}
                    </form>
                </div>
            </div>
        )
    }
}

export abstract class NodeActionForm<A extends Action> extends NodeEditorForm<NodeEditorFormState> {
    private actionUUID: string;

    public getLocalizedObject(): LocalizedObject {
        if (this.props.localizations && this.props.localizations.length == 1) {
            return this.props.localizations[0];
        }
    }

    public getInitial(): A {
        if (this.props.action) {
            return this.props.action as A;
        }
        return null;
    }

    public getActionUUID(): string {
        if (this.props.action) {
            return this.props.action.uuid;
        }

        if (!this.actionUUID) {
            this.actionUUID = UUID.v4();
        }
        return this.actionUUID;
    }
}

export abstract class NodeRouterForm<R extends Router, S extends NodeEditorFormState> extends NodeEditorForm<S> {

    renderExitTranslations(ref: any): JSX.Element {

        // var cases: JSX.Element[] = [];
        var exits: JSX.Element[] = [];

        var language: Language;
        if (this.props.localizations.length > 0) {
            language = this.props.localizations[0].getLanguage();
        }

        if (!language) {
            return null;
        }

        for (let exit of this.props.node.exits) {
            var localized = this.props.localizations.find((localizedObject: LocalizedObject) => { return localizedObject.getObject().uuid == exit.uuid });
            if (localized) {
                var value = null;
                if ("name" in localized.localizedKeys) {
                    var localizedExit: Exit = localized.getObject();
                    value = localizedExit.name;
                }

                exits.push(
                    <div key={"translate_" + exit.uuid} className={formStyles.translating_exit}>
                        <div className={formStyles.translating_from}>
                            {exit.name}
                        </div>
                        <div className={formStyles.translating_to}>
                            <TextInputElement ref={ref} name={exit.uuid} placeholder={language.name + " Translation"} showLabel={false} value={value} />
                        </div>
                    </div >
                );
            }
        }

        return (
            <div>
                <div className={formStyles.title}>Categories</div>
                <div className={formStyles.instructions}>When category names are referenced later in the flow, the appropriate language for the category will be used. If no translation is provided, the original text will be used.</div>
                <div className={formStyles.translating_exits}>{exits}</div>
            </div>
        )
    }

    saveLocalizedExits(widgets: { [name: string]: Widget }) {
        var exits = this.getLocalizedExits(widgets);
        var language = this.props.localizations[0].getLanguage().iso
        this.props.updateLocalizations(language, exits);
    }

    getLocalizedExits(widgets: { [name: string]: Widget }): { uuid: string, translations: any }[] {
        var results: { uuid: string, translations: any }[] = [];
        for (let exit of this.props.node.exits) {
            var input = widgets[exit.uuid] as TextInputElement;
            var value = input.state.value.trim();
            if (value) {
                results.push({ uuid: exit.uuid, translations: { name: [value] } })
            } else {
                results.push({ uuid: exit.uuid, translations: null });
            }
        }
        return results;
    }

    public getInitial(): R {
        if (this.props.node.router) {
            return this.props.node.router as R;
        }
    }
}







