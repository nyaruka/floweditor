import * as React from 'react';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';
import {DragPoint, NodeEditorProps, NodeEditorState, ExitProps, TypeConfig, LocationProps} from '../interfaces';
import {Modal} from './Modal';
import {Config} from '../services/Config';
import {FlowMutator} from '../components/FlowMutator';
import {NodeForm} from './NodeForm';
import * as Select from 'react-select';

export interface NodeModalProps {

    initial?: NodeEditorProps;
    changeType?: boolean;
    onUpdateAction: Function;
    onUpdateRouter: Function;

    newPosition?: LocationProps;
    mutator?: FlowMutator;
    draggedFrom?: DragPoint;
    exits?: ExitProps[];
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
    private form: NodeForm<NodeEditorProps, NodeEditorState>;

    private nodeUUID: string;

    constructor(props: NodeModalProps) {
        super(props);

        this.state = {
            show: false,
            config: this.getConfig(this.props.initial.type)
        }

        this.onModalButtonClick = this.onModalButtonClick.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onChangeType = this.onChangeType.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.processForm = this.processForm.bind(this);
    }

    open() {
        this.setState({
            show: true,
            config: this.getConfig(this.props.initial.type)
        });
    }

    close() {
        this.setState({show: false});
    }

    getConfig(type: string) {
        for (let config of Config.get().typeConfigs) {
            if (type == config.type) {
                return config;
            }
        }
    }

    onModalOpen() {

    }

    processForm() {
        var valid = true;
        var errors: any= {};
        $(this.formElement.elements).each((index: number, ele: HTMLFormElement) => {
            // console.log("processForm", ele);
            if (ele.name) {
                var error = this.form.validate(ele);
                if (error) {
                    var group = $(ele).parents('.form-group')
                    group.addClass('invalid');
                    group.find('.error').text(error);
                    valid = false;
                    errors[error] = true;
                } else {
                    $(ele).parents('.form-group').removeClass('invalid');
                }
            }
        });

        if (!valid) {
            var messages: string[] = [];
            for (var key in errors) {
                if (messages.length == 0) {
                    messages.push(key.charAt(0).toUpperCase() + key.slice(1));
                } else {
                    messages.push(key);
                }
            }

            var allErrors: string;
            if (messages.length == 1) {
                allErrors = messages[0] + ".";
            } else if (messages.length == 2) {
                allErrors = messages.join(" and ") + ".";
            } else {
                allErrors = messages.slice(0, -1).join(", ");
                allErrors += " and " + messages.slice(-1) + ".";
            }

            $(this.formElement).find(".errors").text(allErrors);

        } else {
            // if we are still valid, proceed with submit
            // and finally submit our node
            this.form.submit(this.formElement, this.props);
            this.closeModal();
        }
    }

    private closeModal() {
        if (this.props.draggedFrom) {
            this.props.draggedFrom.onResolved();
        }
        this.close();
    }

    private onModalButtonClick(event: any) {
        if ($(event.target).data('type') == 'ok') {
            this.processForm();
        } else {
            this.closeModal();
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
    private componentDidUpdate() {

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

    render() {
        var data: any = [];
        var changeOptions: JSX.Element;
        if (this.props.changeType) {
            changeOptions = (
                <div>
                    <div className="header">When a contact arrives at this point in your flow</div>
                    <div className="form-group">
                        <Select
                            className={"change-type"}
                            value={this.state.config.type}
                            onChange={this.onChangeType.bind(this)}
                            valueKey="type"
                            searchable={false}
                            clearable={false}
                            labelKey="description"
                            options={Config.get().typeConfigs}
                        />
                    </div>
                </div>
            )
        }

        var form = null;
        if (this.state.show) {
            // create our form element
            if (this.state.config.form != null) {
                var props = this.props.initial as NodeEditorProps
                var ref = (ele: any) => { this.form = ele; }
                var uuid = props.uuid;
                if (!uuid) {
                    uuid =  UUID.v4();
                }
                form = React.createElement(this.state.config.form, {...props, key:uuid, ref:ref, uuid: uuid});
            }
        }

        return (
            <Modal
                width="570px"
                key={'modal_' + this.props.initial.uuid}
                title={<div>{this.state.config.name}</div>}
                className={this.getClassName()}
                show={this.state.show}
                onModalClose={this.onModalButtonClick}
                onModalOpen={this.onModalOpen}
                ok='Save'
                cancel='Cancel'>
                
                <div className="node-editor">
                    <form onKeyPress={this.onKeyPress} ref={(ele: any) => { this.formElement = ele; }}>
                        {changeOptions}
                        <div className="widgets">{form}</div>
                    </form>
                </div>
            </Modal>
        )
    }
}

export default NodeModal;