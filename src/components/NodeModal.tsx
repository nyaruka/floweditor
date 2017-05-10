import * as React from 'react';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';
import {NodeEditorProps, NodeEditorState, ExitProps, TypeConfig} from '../interfaces';
import {Modal} from './Modal';
import {Config} from '../services/Config';
import {FlowMutator} from '../components/FlowMutator';
import {NodeFormComp} from './NodeFormComp';

var Select2 = require('react-select2-wrapper');

interface NodeModalProps {
    initial: NodeEditorProps;
    changeType: boolean;
    exits?: ExitProps[];
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
    private form: NodeFormComp<NodeEditorProps, NodeEditorState>;

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
        $(this.formElement.elements).each((index: number, ele: HTMLFormElement) => {
            if (ele.name) {
                var error = this.form.validate(ele);
                if (error) {
                    var group = $(ele).parents('.form-group')
                    group.addClass('invalid');
                    group.find('.error').text(error);
                    valid = false;
                } else {
                    $(ele).parents('.form-group').removeClass('invalid');
                }
            }
        });

        // if we are still valid, proceed with submit
        if (valid) {
            // and finally submit our node
            this.form.submit(this.formElement);
            this.closeModal();
        }
    }

    private closeModal() {
        if (this.props.initial.draggedFrom) {
            this.props.initial.draggedFrom.onResolved();
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
    private onChangeType(event: any) {
        var type = event.target.value;
        if (type != this.state.config.type) {
            this.setState({ 
                config: this.getConfig(type)
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
        let options: TypeConfig[] = Config.get().typeConfigs;
        options.map((option: TypeConfig) => {
            data.push({id: option.type, text: option.description});
        });

        var changeOptions: JSX.Element;

        if (this.props.changeType) {
            changeOptions = (
                <div>
                    <div className="header">When a contact arrives at this point in your flow</div>
                    <div className="form-group">
                        <Select2
                            className={"change-type"}
                            value={this.state.config.type}
                            onChange={this.onChangeType.bind(this)}
                            data={data}
                        />
                    </div>
                </div>
            )
        }

        var form = null;

        // create our form element
        if (this.state.config.form != null) {
            var props = this.props.initial as NodeEditorProps
            var ref = (ele: any) => { this.form = ele; }
            form = React.createElement(this.state.config.form, {...props, ref:ref});
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