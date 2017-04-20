import * as React from 'react';
import * as Interfaces from '../interfaces';
import * as Renderer from '../components/Renderer';
import Config from '../services/Config';

var UUID  = require('uuid');
var ReactModal = require('react-modal');
var Select2 = require('react-select2-wrapper');


interface ModalProps {
    show: boolean;
    onModalOpen: any;
    onModalClose: any;
    className: string;
    title: JSX.Element;
    width?: string;

    // button options
    ok?: string;
    cancel?: string;
    tertiary?: string;
}

/**
 * A base modal for displaying messages or performing single button actions
 */
export class Modal extends React.Component<ModalProps, {}> {

    private ele: any

    constructor(props: ModalProps) {
        super(props);
    }

    render() {
        var customStyles = {
            content : {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '40px',
                bottom: 'initial',
                padding: 'none',
                borderRadius: 'none',
                outline: 'none',
                width: this.props.width ? this.props.width : "700px",
                border: 'none'
            }
        }

        var rightButtons: JSX.Element[] = [];
        var leftButtons: JSX.Element[] = [];

        if (this.props.cancel) {
            rightButtons.push(<a key={Math.random()} href="javascript:void(0);" data-type="cancel" className='btn cancel grey' onClick={this.props.onModalClose}>{this.props.cancel}</a>)
        }
        
        // no matter what, we'll have a primary button
        rightButtons.push(<a key={Math.random()} href="javascript:void(0);" data-type="ok" className='btn ok' onClick={this.props.onModalClose}>{this.props.ok ? this.props.ok : 'Ok'}</a>)

        // our left most button if we have one
        if (this.props.tertiary) {
            leftButtons.push(<a key={Math.random()} href="javascript:void(0);" data-type="tertiary" className='btn tertiary' onClick={this.props.onModalClose}>{this.props.tertiary}</a>)
        }
        

        return (
            <ReactModal
                isOpen={this.props.show}
                onAfterOpen={this.props.onModalOpen}
                onRequestClose={this.props.onModalClose}
                style={customStyles}
                shouldCloseOnOverlayClick={false}
                contentLabel="blerg"
                closeTimeoutMS={200}>

                <div ref={(ele: any) => {this.ele = ele;}} className={"modal " + this.props.className}>
                    <div className="modal-header">
                        {this.props.title}
                    </div>
                    <div className="modal-content">
                        {this.props.children}
                    </div>
                    <div className="modal-footer">
                        <div className="left">
                            {leftButtons}
                        </div>
                        <div className="right">
                            {rightButtons}
                        </div>
                    </div>
                </div>                
            </ReactModal>
        )
    }
}

interface NodeModalProps {
    initial: Interfaces.NodeEditorProps;
    renderer: Renderer.Renderer;
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

    context: Interfaces.FlowContext;
    
    static contextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }
    
    constructor(props: NodeModalProps) {
        super(props);

        // stick our initialized renderer in our map
        this.rendererMap[this.props.initial.type] = this.props.renderer;

        this.state = {
            show: false,
            renderer: this.getRenderer(this.props.initial.type, this.props.initial),
            config: this.getConfig(this.props.initial.type)
        }

        this.onModalClose = this.onModalClose.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onChangeType = this.onChangeType.bind(this);
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
            this.rendererMap[type] = new config.renderer(props);
        }
        return this.rendererMap[type]
    }

    onModalOpen() {

    }
    
    onModalClose(event: any) {
        if ($(event.target).data('type') == 'ok') {
            this.state.renderer.submit(this.context, this.form);
        } else {
            this.context.flow.onModalCancel();
        }

        // force a clean object form now that we are done
        delete this.rendererMap[this.props.initial.type];
        this.close();
    }

    onChangeType(event: any) {
        var type = event.target.value;
        this.setState({ 
            renderer: this.getRenderer(type, {type: type} as Interfaces.NodeEditorProps),
            config: this.getConfig(type)
        });
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
                        onChange={this.onChangeType}
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
                onModalClose={this.onModalClose}
                onModalOpen={this.onModalOpen}
                ok='Save'
                cancel='Cancel'
                >
                
                <div className="node-editor">
                    <form ref={(ele: any) => { this.form = ele; }}>
                        {changeOptions}
                        <div className="widgets">{renderer.renderForm()}</div>
                    </form>
                </div>
            </Modal>
        )
    }
}

export default Modal;