import * as React from "react";
import * as UUID from "uuid";
import { Modal, ButtonSet } from "./Modal";
import { Node, Router, Action, SendMessage, UINode } from "../FlowDefinition";
import { TypeConfig, Config } from "../services/Config";
import { ComponentMap } from "./ComponentMap";
import { TextInputElement } from "./form/TextInputElement";
import { FlowContext } from "./Flow";
import { FormWidget, FormValueState } from "./form/FormWidget";
import { FormElementProps } from "./form/FormElement";
import { ButtonProps } from "./Button";
import { LocalizedObject } from "../Localization";

var Select = require('react-select');
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

    private formElement: HTMLFormElement;
    private form: NodeEditorForm<NodeEditorFormState>;

    constructor(props: NodeEditorProps) {
        super(props);

        this.onOpen = this.onOpen.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);

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
        this.setState({
            show: false
        }, () => {
            this.props.onClose(canceled);
        })
    }

    onOpen() {
    };

    onSave() {
        if (this.form.submit()) {
            this.close(false);
        }
    }

    onCancel() {
        this.close(true);
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
                if (this.form.submit()) {
                    this.close(false);
                }
            }
        }
    }

    private onTypeChange(config: TypeConfig) {
        this.setState({
            config: config
        });
    }

    render() {
        var form: any = null;
        if (this.state.show) {
            // create our form element
            if (this.state.config.form != null) {
                var ref = (ele: any) => { this.form = ele; }

                var formProps: NodeEditorFormProps = {
                    config: this.state.config,
                    node: this.props.node,
                    action: this.props.action,
                    onTypeChange: this.onTypeChange,
                    localizations: this.props.localizations,

                    resetButtons: () => {
                        this.setState({
                            temporaryButtons: null
                        })
                    },

                    setButtons: (buttons: ButtonSet) => {
                        this.setState({
                            temporaryButtons: buttons
                        })
                    },

                    updateLocalization: (uuid: string, language: string, values: any) => {
                        this.props.context.eventHandler.onUpdateLocalization(uuid, language, values);
                    },

                    updateAction: (action: Action) => {
                        this.props.context.eventHandler.onUpdateAction(this.props.node, action);
                    },

                    updateRouter: (node: Node, type: string, previousAction?: Action) => {
                        this.props.context.eventHandler.onUpdateRouter(node, type, previousAction);
                    }
                };

                form = React.createElement(this.state.config.form, { ref: ref, ...formProps });
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

        return (
            <Modal
                key={key}
                className={shared[this.state.config.type]}
                width="600px"
                title={<div>{this.state.config.name}</div>}
                show={this.state.show}
                buttons={buttons}
                onModalOpen={this.onOpen}>
                <div className={formStyles.node_editor}>
                    <form onKeyPress={this.onKeyPress} ref={(ele: any) => { this.formElement = ele; }}>
                        {<div>{form}</div>}
                    </form>
                </div>

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
        var options = Config.get().typeConfigs;
        return (
            <div className={this.props.className}>
                <p>When a contact arrives at this point in your flow</p>
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

abstract class Widget extends FormWidget<FormElementProps, FormValueState> { }

export interface NodeEditorFormProps {
    config: TypeConfig;
    node: Node;
    localizations?: LocalizedObject[];
    action?: Action;

    // allow forms to modify the buttons on our modal
    setButtons(buttons: ButtonSet): void;
    resetButtons(): void;

    onTypeChange(config: TypeConfig): void;
    updateLocalization(uuid: string, language: string, translations: any): void;
    updateAction(action: Action): void;
    updateRouter(node: Node, type: string, previousAction: Action): void;
}

export interface NodeEditorFormState {
    showAdvanced: boolean;
}

abstract class NodeEditorForm<S extends NodeEditorFormState> extends React.PureComponent<NodeEditorFormProps, S> {

    abstract onValid(): void;
    abstract renderForm(ref: any): JSX.Element;

    private elements: { [name: string]: Widget } = {};
    private advancedWidgets: { [name: string]: boolean } = {};

    public getWidget(name: string): Widget {
        return this.elements[name];
    }

    public renderAdvanced(ref: any): JSX.Element {
        return null;
    }

    public addWidget(widget: Widget) {
        if (widget) {
            if (this.elements) {
                this.elements[widget.props.name] = widget;
            }
        }
    }

    public addAdvancedWidget(widget: Widget) {
        if (widget) {
            this.addWidget(widget);
            this.advancedWidgets[widget.props.name] = true;
        }
    }

    public submit(): boolean {

        var invalid: Widget[] = [];
        for (let key in this.elements) {
            let widget = this.elements[key];
            if (!widget.validate()) {
                invalid.push(widget);
            }
        }

        // if we are valid, submit it
        if (invalid.length == 0) {
            this.onValid();
            return true;
        } else {
            var advError = false;
            for (let widget of invalid) {
                if (this.advancedWidgets[widget.props.name]) {
                    advError = true;
                    break;
                }
            }

            if (advError) {
                this.showAdvanced();
            }
        }

        return false;
    }

    public showAdvanced(event?: React.MouseEvent<HTMLElement>) {
        this.setState({
            showAdvanced: true
        })

        this.props.setButtons({ primary: { name: "Back", onClick: () => { this.hideAdvanced() } } });

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

    }

    public hideAdvanced(event?: React.MouseEvent<HTMLElement>) {
        this.setState({
            showAdvanced: false
        });

        this.props.resetButtons();

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    render() {
        this.elements = {};
        this.advancedWidgets = {};

        var advanced = this.renderAdvanced(this.addAdvancedWidget.bind(this));

        var form = null;
        var classes = [formStyles.form];
        if (this.state && this.state.showAdvanced) {
            classes.push(formStyles.advanced);
        }

        var advButtons = null;
        if (advanced) {
            advButtons = (
                <div className={formStyles.advanced_buttons}>
                    <div className={formStyles.show_advanced_button} onClick={this.showAdvanced.bind(this)}><span className="icon-settings"></span></div>
                    <div className={formStyles.hide_advanced_button} onClick={this.hideAdvanced.bind(this)}><span className="icon-back"></span></div>
                </div>
            )
        }

        var chooser = null;
        if (!this.props.localizations || this.props.localizations.length == 0) {
            chooser = <TypeChooser className={formStyles.type_chooser} initialType={this.props.config} onChange={this.props.onTypeChange} />
        }

        return (
            <div className={classes.join(" ")}>
                {advButtons}
                {chooser}
                <div key={"primary"} className={formStyles.primary_form}>
                    {this.renderForm(this.addWidget.bind(this))}
                </div>
                <div key={"secondary"} className={formStyles.advanced_form}>
                    {advanced}
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
    public getInitial(): R {
        if (this.props.node.router) {
            return this.props.node.router as R;
        }
    }
}







