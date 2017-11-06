import * as React from 'react';
import Modal, { IButtonSet } from '../Modal';
import { INode, IAction, IUINode } from '../../flowTypes';
import {
    IType,
    IOperator,
    EMode,
    TGetTypeConfig,
    TGetOperatorConfig,
    IEndpoints
} from '../../services/EditorConfig';
import ComponentMap from '../../services/ComponentMap';
import { IFlowContext } from '../Flow';
import { LocalizedObject } from '../../services/Localization';
import NodeEditorForm, { INodeEditorFormProps, INodeEditorFormState } from './NodeEditorForm';
import Widget from './Widget';

const formStyles = require('./NodeEditor.scss');
const shared = require('../shared.scss');

export interface INodeEditorProps {
    node: INode;
    action?: IAction;
    nodeUI?: IUINode;
    actionsOnly?: boolean;
    localizations?: LocalizedObject[];
    context: IFlowContext;
    // actions to perform when we are closed
    onClose?(canceled: boolean): void;

    typeConfigList: IType[];
    operatorConfigList: IOperator[];
    getTypeConfig: TGetTypeConfig;
    getOperatorConfig: TGetOperatorConfig;
    endpoints: IEndpoints;
    ComponentMap: ComponentMap;
}

export interface INodeEditorState {
    config: IType;
    show: boolean;
    initialButtons: IButtonSet;
    temporaryButtons?: IButtonSet;
}

function getType(props: INodeEditorProps) {
    var type: string;
    if (props.action) {
        return props.action.type;
    } else {
        if (props.nodeUI && props.nodeUI.type) {
            return props.nodeUI.type;
        }
    }

    var details = props.ComponentMap.getDetails(props.node.uuid);
    if (details.type) {
        return details.type;
    }

    if (props.node.router) {
        return props.node.router.type;
    }

    return null;
}

class NodeEditor extends React.PureComponent<INodeEditorProps, INodeEditorState> {
    private modal: Modal;
    private form: NodeEditorForm<INodeEditorFormState>;
    private advanced: NodeEditorForm<INodeEditorFormState>;
    private widgets: { [name: string]: Widget } = {};
    private advancedWidgets: { [name: string]: boolean } = {};

    constructor(props: INodeEditorProps) {
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
            throw new Error(
                'Cannot initialize NodeEditor without a valid type: ' + this.props.node.uuid
            );
        }

        this.state = {
            show: false,
            config: this.props.getTypeConfig(type),
            initialButtons: {
                primary: { name: 'Save', onClick: this.onSave },
                secondary: { name: 'Cancel', onClick: this.onCancel }
            }
        };
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
            this.form.onValid(this.widgets);
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
            if (
                (frontError && this.modal.state.flipped) ||
                (!frontError && !this.modal.state.flipped)
            ) {
                this.toggleAdvanced();
            }
        }

        return false;
    }

    getType(): string {
        var type: string;
        if (this.props.action) {
            type = this.props.action.type;
        } else {
            var details = this.props.ComponentMap.getDetails(this.props.node.uuid);
            type = details.type;
        }
        return type;
    }

    open() {
        this.setState({
            show: true,
            config: this.props.getTypeConfig(getType(this.props))
        });
    }

    close(canceled: boolean) {
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

    onOpen() {}

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
            var isTextarea = $(event.target).prop('tagName') == 'TEXTAREA';
            if (!isTextarea || event.shiftKey) {
                event.preventDefault();
                if (this.submit()) {
                    this.close(false);
                }
            }
        }
    }

    private onTypeChange(config: IType) {
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
        var mode = EMode.EDITING;
        if (isTranslating) {
            mode = EMode.TRANSLATING;
        }

        this.widgets = {};
        this.advancedWidgets = {};

        var front: JSX.Element = null;
        var back: JSX.Element = null;

        if (this.state.show) {
            // create our form element
            if (this.state.config.form != null) {
                var formProps: INodeEditorFormProps = {
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
                        this.props.context.eventHandler.onUpdateLocalizations(language, changes);
                    },

                    updateAction: (action: IAction) => {
                        this.props.context.eventHandler.onUpdateAction(this.props.node, action);
                    },

                    updateRouter: (node: INode, type: string, previousAction?: IAction) => {
                        this.props.context.eventHandler.onUpdateRouter(node, type, previousAction);
                    }
                };

                front = React.createElement(this.state.config.form, {
                    ref: (ele: any) => {
                        this.form = ele;
                    },
                    ...formProps
                });
                if (this.state.config.allows(mode)) {
                    back = React.createElement(this.state.config.form, {
                        ref: (ref: any) => {
                            this.advanced = ref;
                        },
                        advanced: true,
                        ...formProps
                    });
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
            titleText = this.props.localizations[0].getLanguage().name + ' Translation';
        }

        var titles: JSX.Element[] = [<div>{titleText}</div>];
        if (back) {
            titles.push(
                <div>
                    <div>{titleText}</div>
                    <div className={shared.advanced_title}>Advanced Settings</div>
                </div>
            );
        }

        return (
            <Modal
                key={key}
                ref={(ref: any) => {
                    this.modal = ref;
                }}
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

export default NodeEditor;
