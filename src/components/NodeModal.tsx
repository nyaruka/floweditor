import * as React from 'react';
import * as Interfaces from '../interfaces';
import * as Renderer from '../components/Renderer';
import Modal from './Modal';
import Config from '../services/Config';

var UUID  = require('uuid');

var Select2 = require('react-select2-wrapper');

interface NodeModalProps {
    initial: Interfaces.NodeEditorProps;
    context: Interfaces.FlowContext;
    renderer?: Renderer.Renderer;
    changeType: boolean;
}

interface NodeModalState {
    show: boolean;
    renderer: Renderer.Renderer;
    config: Interfaces.TypeConfig;
}

/**
 * A modal for editing node properties such as actions or a router
 */
export class NodeModal extends React.Component<NodeModalProps, NodeModalState> {
    
    private rendererMap: {[type:string]:Renderer.Renderer; } = {}
    private form: HTMLFormElement;
    private nodeUUID: string;

    static contextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }
    
    constructor(props: NodeModalProps) {
        super(props);

        // stick our initialized renderer in our map
        if (this.props.renderer) {
            this.rendererMap[this.props.initial.type] = this.props.renderer;
        }

        this.state = {
            show: false,
            renderer: this.getRenderer(this.props.initial.type, this.props.initial),
            config: this.getConfig(this.props.initial.type)
        }

        this.onModalButtonClick = this.onModalButtonClick.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onChangeRenderer = this.onChangeRenderer.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.processForm = this.processForm.bind(this);
    }

    editNewAction(nodeUUID: string) {
        // we want to start from an empty slate
        this.rendererMap = {}
        this.setState({
            renderer: this.getRenderer("msg", {uuid: UUID.v4(), type: "msg", nodeUUID: nodeUUID} as Interfaces.NodeEditorProps),
            config: this.getConfig("msg"),
            show: true,
        });

        this.nodeUUID = nodeUUID;
    }

    open() {
        this.setState({
            show: true,
            renderer: this.getRenderer(this.props.initial.type, this.props.initial),
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

    getRenderer (type: string, props?: Interfaces.NodeEditorProps): Renderer.Renderer {
        if (!(type in this.rendererMap)) {
            let config = this.getConfig(type);
            this.rendererMap[type] = new config.renderer(props, this.props.context);
        }
        return this.rendererMap[type]
    }

    onModalOpen() {

    }

    processForm() {
        var valid = true;
        $(this.form.elements).each((index: number, ele: HTMLFormElement) => {
            if (ele.name) {
                var error = this.state.renderer.validate(ele);
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
            this.state.renderer.submit(this.form);
            this.closeModal();
        }
    }

    private closeModal() {
        this.props.context.flow.removeDragNode();
        this.close();

        // force a clean object form now that we are done
        this.rendererMap = {};
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
    private onChangeRenderer(event: any) {

        var nodeUUID = this.nodeUUID;
        if (this.props.context.node) {
            nodeUUID = this.props.context.node.props.uuid;
        }

        var type = event.target.value;
        this.setState({ 
            renderer: this.getRenderer(type, {type: type, uuid:this.props.initial.uuid, nodeUUID: nodeUUID} as Interfaces.NodeEditorProps),
            config: this.getConfig(type)
        });
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

    render() {
        var data: any = [];
        let options: Interfaces.TypeConfig[] = Config.get().typeConfigs;
        options.map((option: Interfaces.TypeConfig) => {
            data.push({id: option.type, text: option.description});
        });

        var renderer = this.state.renderer;
        var changeOptions: JSX.Element;

        if (this.props.changeType) {
            changeOptions = (
                <div>
                    <div className="header">When a contact arrives at this point in your flow</div>
                    <Select2
                        className={"change-type"}
                        value={renderer.props.type}
                        onChange={this.onChangeRenderer}
                        data={data}
                    />
                </div>
            )
        }

        return (
            <Modal
                width="570px"
                key={'modal_' + this.props.initial.uuid}
                title={<div>{this.state.config.name}</div>}
                className={renderer.getClassName()}
                show={this.state.show}
                onModalClose={this.onModalButtonClick}
                onModalOpen={this.onModalOpen}
                ok='Save'
                cancel='Cancel'
                >
                
                <div className="node-editor">
                    <form onKeyPress={this.onKeyPress}  ref={(ele: any) => { this.form = ele; }}>
                        {changeOptions}
                        <div className="widgets">{renderer.renderForm()}</div>
                    </form>
                </div>
            </Modal>
        )
    }
}

export default NodeModal;