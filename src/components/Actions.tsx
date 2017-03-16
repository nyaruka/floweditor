import * as React from "react";
import * as axios from "axios";
import {ActionProps, AddToGroupProps, SendMessageProps, SaveToContactProps, SetLanguageProps, NodeProps, FlowContext} from '../interfaces'
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import Modal from './Modal';

var UUID  = require("uuid");

export interface ActionState {
    editing: boolean;
}

/**
 * Base Action class for the rendered flow
 */
export class ActionComp<P extends ActionProps> extends React.Component<P, ActionState> {

    public form: HTMLFormElement;

    static contextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }
    
    context: FlowContext;
    
    constructor(props: P) {
        super(props);
        this.state = {
            editing: false
        }

        this.onClick = this.onClick.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
    }

    static createAction(action: ActionProps, node: NodeProps) {
        if (action.type == "add_to_group") {
            return <AddToGroupActionComp {...action as AddToGroupProps} key={action.uuid}/>
        } else if (action.type == "save_to_contact") {
            var props = action as SaveToContactProps;
            return <SaveToContactActionComp {...action as SaveToContactProps} key={action.uuid}/>
        } else if (action.type == "msg") {
            return <SendMessageActionComp {...action as SendMessageProps} key={action.uuid}/>            
        } else if (action.type == "set_language") {
            return <SetLanguageActionComp {...action as SetLanguageProps} key={action.uuid}/>
        }
    }

    setEditing(editing: boolean) {
        this.setState({editing: editing})
    }

    onModalOpen() {
        // console.log('modal open');
    }

    onModalClose() {

        var textarea: HTMLTextAreaElement = $(this.form).find('textarea')[0] as HTMLTextAreaElement;        
        this.setState({
            editing: false
        });

        // this.props.flow.updateAction(this.props.uuid, textarea.value);
        // FlowStore.get().getCurrentDefinition().updateAction(this.props.uuid, textarea.value);
        // FlowStore.get().markDirty();
        // var node = FlowStore.get().getCurrentDefinition().getNode(this.props.node.uuid);
        // this.props.flow.forceUpdate()
    }

    onClick (event: any) {
        if (!this.context.node.state.dragging) {
            this.setEditing(true);
        }
    }

    render() {
        return(
            <div>
                <div className={'action ' + this.getClassName()} 
                     onMouseUp={(event)=>{ this.onClick(event); }}>
                    <div className="action-title">
                      {this.renderTitle()}
                    </div>
                    <div className="action-content">
                        {this.renderBody()}
                    </div>
                </div>

                <Modal 
                    title={this.renderTitle()}
                    className={this.getClassName()}
                    show={this.state.editing} 
                    onModalClose={this.onModalClose} 
                    onModalOpen={this.onModalOpen}>

                    <form ref={(ele: any) => { this.form = ele; }}>
                        {this.renderForm()}
                    </form>
                </Modal>
            </div>
        )
    }

    getClassName() {
        return this.props.type.split('_').join('-');
    }
    
    getType() {
        console.log(this.props.type);
        return this.props.type;
    }

    renderTitle() { return <div>node title</div>; }
    renderBody() { return <div>node body</div>; }
    
    renderForm() {

        // this will go away once we have first class editing
        var cloned = (Object as any).assign({}, this.props);
        delete cloned['flow'];

        return (
            <div>
                <textarea className="definition" defaultValue={JSON.stringify(cloned, null, 2)}></textarea>
            </div>
        );
    }
}

export class AddToGroupActionComp extends ActionComp<AddToGroupProps> {
    constructor(props: AddToGroupProps) {
        super(props);
    }
    renderTitle() { return <span>Add To Group</span> }
    renderBody() { return <div>Add contact to the {this.props.label} group.</div> }
}

export class SaveToContactActionComp extends ActionComp<SaveToContactProps> {
    renderTitle() { return <span>Save To Contact</span> }
    renderBody() { return <div>Update {this.props.label}.</div> }
}

export class SendMessageActionComp extends ActionComp<SendMessageProps> {
    
    renderTitle() { return <span>Send Message</span> }
    renderBody() { return <div>{this.props.text}</div>; }
    renderForm() {
        return (
             <div>
                <textarea className="definition" defaultValue={this.props.text}></textarea>
            </div>
        )
    }

    onModalClose() {
        var textarea: HTMLTextAreaElement = $(this.form).find('textarea')[0] as HTMLTextAreaElement;
        this.setState({ editing: false });
        this.context.flow.updateAction(this.props.uuid, {text: {$set: textarea.value}});

        // force a repaint since our node size likely changed
        Plumber.get().repaint(this.context.node.props.uuid);
    }

}

export class SetLanguageActionComp extends ActionComp<SetLanguageProps> {
    renderTitle() { return <span>Set Language</span>; }
    renderBody() { return <div>Update contact language {this.props.language}.</div>; }
}

export default ActionComp;
