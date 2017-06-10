import * as React from 'react';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';
import { Modal } from './Modal';
import { Config, TypeConfig } from '../services/Config';
import { FlowMutator } from './FlowMutator';
import { DragPoint } from './Node';
import { FlowContext } from './Flow';
import { NodeForm } from './NodeForm';
import { Node, Position, Exit, UINode, Action } from '../FlowDefinition';

var Select = require('react-select');
var styles = require('./NodeModal.scss');
var shared = require('./shared.scss');

export interface NodeEditorProps {
    type: string;
    uuid: string;
    context: FlowContext;
    config: TypeConfig;
}

export interface EditableProps {
    initial: NodeEditorProps;
    type: string;
    uuid: string;
    context: FlowContext;
}

export interface NodeModalProps {

    onlyActions: boolean;
    onClose(): void;

    editableProps?: EditableProps;
    changeType?: boolean;

    onUpdateAction(action: Action, previousNodeUUID: string): void;
    onUpdateRouter(node: Node, type: string): void;

    newPosition?: Position;
    mutator?: FlowMutator;
    draggedFrom?: DragPoint;
    exits?: Exit[];
    addToNode?: string;

}

interface NodeModalState {
    show: boolean;
    config: TypeConfig;
}

/**
 * A modal for editing node properties such as actions or a router
 */
export class NodeModal extends React.Component<NodeModalProps, NodeModalState> {

    private formElement: HTMLFormElement;
    private form: NodeForm<NodeEditorProps, any>;

    private nodeUUID: string;

    constructor(props: NodeModalProps) {
        super(props);

        this.state = {
            show: false,
            config: Config.get().getTypeConfig(this.props.editableProps.type)
        }

        this.onClickSave = this.onClickSave.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this.onChangeType = this.onChangeType.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.processForm = this.processForm.bind(this);
    }

    open() {
        this.setState({
            show: true,
            config: Config.get().getTypeConfig(this.props.editableProps.type)
        });
    }

    close() {
        this.setState({ show: false });
        if (this.props.onClose) {
            this.props.onClose()
        }
    }

    onModalOpen() {

    }

    processForm() {

        var valid = true;
        for (let formWidget of this.form.getElements()) {
            if (!formWidget.validate()) {
                valid = false;
            }
        }

        // if we are valid, submit it
        if (valid) {
            this.form.submit(this);
            this.closeModal(false);
        }
    }

    private closeModal(canceled: boolean) {
        if (this.props.draggedFrom) {
            this.props.draggedFrom.onResolved(canceled);
        }
        this.close();
    }

    private onClickSave() {
        this.processForm();
    }

    private onModalButtonClick(event: any) {
        if ($(event.target).data('type') == 'ok') {
            this.processForm();
        } else {
            this.closeModal(true);
        }
    }

    /**
     * A change to our renderer type
     */
    private onChangeType(config: TypeConfig) {
        if (config.type != this.state.config.type) {
            this.setState({
                config: config
            });
        }
    }

    /** 
     * Our properties changed
     */
    componentDidUpdate() {

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
                this.processForm();
            }
        }
    }

    public getClassName() {
        return this.state.config.type.split('_').join('-');
    }

    public onUpdateAction(action: Action) {
        var previousNodeUUID = null;
        var initialUUID = this.props.editableProps.initial.uuid;
        if (initialUUID != action.uuid) {
            previousNodeUUID = initialUUID;
        }

        this.props.onUpdateAction(action, previousNodeUUID);
    }

    public onUpdateRouter(node: Node, type: string) {
        this.props.onUpdateRouter(node, type)
    }

    render() {
        var data: any = [];
        var changeOptions: JSX.Element;
        if (this.props.changeType) {

            var options = [];
            if (this.props.onlyActions) {
                options = Config.get().getActionTypes();
            } else {
                options = Config.get().typeConfigs;
            }

            changeOptions = (
                <div>
                    <div className={styles.header}>When a contact arrives at this point in your flow</div>
                    <div className={styles["form-group"]}>
                        <Select
                            className={styles["change-type"]}
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

        var form: any = null;
        if (this.state.show) {
            // create our form element
            if (this.state.config.form != null) {
                var props = this.props.editableProps;
                var ref = (ele: any) => { this.form = ele; }
                var uuid = props.uuid;
                if (!uuid) {
                    uuid = UUID.v4();
                }

                form = React.createElement(this.state.config.form, { ...props.initial, key: uuid, ref: ref, uuid: uuid, config: this.state.config });
            }
        }

        return (
            <Modal
                width="570px"
                key={'modal_' + this.props.editableProps.uuid}
                title={<div>{this.state.config.name}</div>}
                className={shared[this.state.config.type]}
                show={this.state.show}
                onClickPrimary={this.onClickSave}
                onClickSecondary={this.closeModal}
                onModalOpen={this.onModalOpen}
                ok='Save'
                cancel='Cancel'>

                <div className={styles["node_editor"]}>
                    <form onKeyPress={this.onKeyPress} ref={(ele: any) => { this.formElement = ele; }}>
                        {changeOptions}
                        <div className={styles["widgets"]}>{form}</div>
                    </form>
                </div>
            </Modal>
        )
    }
}

export default NodeModal;