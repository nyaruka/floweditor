import * as React from "react";
import * as axios from "axios";
import {ActionProps, AddToGroupProps, SendMessageProps, SaveToContactProps, SetLanguageProps, NodeProps} from '../interfaces'
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
            return <AddToGroupActionComp {...action as AddToGroupProps} key={Math.random()}/>
        } else if (action.type == "save_to_contact") {
            var props = action as SaveToContactProps;
            return <SaveToContactActionComp {...action as SaveToContactProps} key={Math.random()}/>
        } else if (action.type == "msg") {
            return <SendMessageActionComp {...action as SendMessageProps} key={Math.random()}/>            
        } else if (action.type == "set_language") {
            return <SetLanguageActionComp {...action as SetLanguageProps} key={Math.random()}/>
        }
    }

    setEditing(editing: boolean) {
        this.setState({editing: editing})
    }

    onModalOpen() {
        console.log('modal open');
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

    isDragging() {
        return $('#root').hasClass('dragging');
    }

    onClick (event: any) {
        if (!this.isDragging()) {
            this.setEditing(true);
        }
    }

    render() {
        return(
            <div>
                <div className={'action ' + this.getClassName()} 
                     onClick={(event)=>{ this.onClick(event); }}>
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
        console.log(textarea.value);
        this.setState({
            editing: false
        });

        this.props.flow.updateMessageAction(this.props.uuid, textarea.value);
    }

}

export class SetLanguageActionComp extends ActionComp<SetLanguageProps> {
    renderTitle() { return <span>Set Language</span>; }
    renderBody() { return <div>Update contact language {this.props.language}.</div>; }
}

export default ActionComp;
