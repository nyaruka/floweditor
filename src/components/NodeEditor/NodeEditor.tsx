import * as React from 'react';
import Modal, { IButtonSet } from '../Modal';
import { Action, Node, UINode } from '../../flowTypes';
import {
    Type,
    Operator,
    EMode,
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

    // actions to perform when we are closed
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
    initialButtons: IButtonSet;
    temporaryButtons?: IButtonSet;
}

export default class NodeEditor extends React.PureComponent<NodeEditorProps, NodeEditorState> {
    private modal: Modal;
    private form: any;
    private advanced: any;
    private widgets: { [name: string]: any } = {};
    private advancedWidgets: { [name: string]: boolean } = {};

    constructor(props: NodeEditorProps) {
        super(props);

        // determine our initial config
        const type = this.determineConfig(this.props);

        this.state = {
            show: false,
            config: this.props.getTypeConfig(type),
            initialButtons: {
                primary: { name: 'Save', onClick: this.onSave.bind(this) },
                secondary: { name: 'Cancel', onClick: this.onCancel.bind(this) }
            }
        };

        this.onOpen = this.onOpen.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onBindWidget = this.onBindWidget.bind(this);
        this.onBindAdvancedWidget = this.onBindAdvancedWidget.bind(this);
        this.toggleAdvanced = this.toggleAdvanced.bind(this);
        this.triggerFormUpdate = this.triggerFormUpdate.bind(this);
        this.removeWidget = this.removeWidget.bind(this);
    }

    private determineConfig(props: NodeEditorProps) {
        if (props.action) {
            return props.action.type;
        } else {
            if (props.nodeUI && props.nodeUI.type) {
                return props.nodeUI.type;
            }
        }

        const details = props.ComponentMap.getDetails(props.node.uuid);

        if (details.type) {
            return details.type;
        }

        if (props.node.router) {
            return props.node.router.type;
        }

        throw new Error(
            `Cannot initialize NodeEditor without a valid type: ${this.props.node.uuid}`
        );
    }

    public onBindWidget(widget: any) {
        if (widget) {
            if (this.widgets) {
                this.widgets[widget.props.name] = widget;
            }
        }
    }

    public onBindAdvancedWidget(widget: any) {
        if (widget) {
            this.onBindWidget(widget);
            this.advancedWidgets[widget.props.name] = true;
        }
    }

    public submit(): boolean {
        let invalid: any[] = [];

        for (const key in this.widgets) {
            let widget = this.widgets[key];
            if (!widget.validate()) {
                invalid = [...invalid, widget];
            }
        }

        /** If we are valid, submit it */
        if (invalid.length === 0) {
            this.form.onValid(this.widgets);
            return true;
        } else {
            let frontError = false;
            for (let widget of invalid) {
                if (!this.advancedWidgets[widget.props.name]) {
                    frontError = true;
                    break;
                }
            }

            /** Show the right pane for our error */
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
        let type: string;

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
            config: this.props.getTypeConfig(this.determineConfig(this.props))
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

    private onTypeChange(config: Type) {
        this.widgets = {};
        this.advancedWidgets = {};

        this.setState({
            config
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
        const isTranslating: boolean = this.props.localizations && this.props.localizations.length > 0;

        let mode: EMode;

        if (isTranslating) {
            mode = EMode.TRANSLATING;
        } else {
            mode = EMode.EDITING;
        }

        const advanced: boolean = this.state.config.allows(mode);

        this.widgets = {};
        this.advancedWidgets = {};

        let front: JSX.Element;
        let back: JSX.Element;

        if (this.state.show) {
            // create our form element
            if (this.state.config.hasOwnProperty('form') && this.state.config.form) {
                const nodeEditorProps = {
                    isTranslating,
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

                const { config: { form: Form } } = this.state;

                front = (
                    <NodeEditorFormComp
                        ref={(ele: any) => (this.form = ele)}
                        {...{ ...nodeEditorProps, advanced: false }}>
                        {formProps => <Form {...formProps} />}
                    </NodeEditorFormComp>
                );

                if (advanced) {
                    back = (
                        <NodeEditorFormComp
                            ref={(ele: any) => (this.advanced = ele)}
                            {...{ ...nodeEditorProps, advanced: true }}>
                            {formProps => <Form {...formProps} />}
                        </NodeEditorFormComp>
                    );
                }
            }
        }

        let key: string = `modal_${this.props.node.uuid}`;

        if (this.props.action) {
            key += `_${this.props.action.uuid}`;
        }

        let buttons: IButtonSet;

        if (this.state.temporaryButtons) {
            buttons = this.state.temporaryButtons;
        } else {
            buttons = this.state.initialButtons;
        }

        let titleText: string = this.state.config.name;

        if (this.props.localizations && this.props.localizations.length > 0) {
            titleText = `${this.props.localizations[0].getLanguage().name} Translation`;
        }

        let titles: JSX.Element[] = [<div>{titleText}</div>];

        if (back) {
            titles = [
                ...titles,
                <div>
                    <div>{titleText}</div>
                    <div className={shared.advanced_title}>Advanced Settings</div>
                </div>
            ];
        }

        return (
            <Modal
                key={key}
                ref={(ref: any) => (this.modal = ref)}
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
