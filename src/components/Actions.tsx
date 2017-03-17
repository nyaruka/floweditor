import * as React from "react";
import * as axios from "axios";
import * as Interfaces from '../interfaces'
import * as Forms from './ActionForms';
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {FlowComp} from './Flow';
import Modal from './Modal';

let UUID  = require("uuid");


export interface ActionState {
    editing: boolean;
}

/**
 * Base Action class for the rendered flow
 */
export abstract class ActionComp<P extends Interfaces.ActionProps> extends React.Component<P, ActionState> {

    public form: HTMLFormElement;
    
    abstract actionForm: Forms.ActionForm;    
    abstract renderNode(): JSX.Element;
    abstract onModalClose(): void;

    static contextTypes = {
        flow: React.PropTypes.object,
        node: React.PropTypes.object
    }
    
    context: Interfaces.FlowContext;
    
    constructor(props: P) {
        super(props);
        this.state = {
            editing: false
        }

        this.onClick = this.onClick.bind(this);
        this.onModalOpen = this.onModalOpen.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
    }

    static createAction(action: Interfaces.ActionProps, node: Interfaces.NodeProps) {
        if (action.type == "add_to_group") {
            return <AddToGroupActionComp {...action as Interfaces.AddToGroupProps} key={action.uuid}/>
        } else if (action.type == "save_to_contact") {
            var props = action as Interfaces.SaveToContactProps;
            return <SaveToContactActionComp {...action as Interfaces.SaveToContactProps} key={action.uuid}/>
        } else if (action.type == "msg") {
            return <SendMessageActionComp {...action as Interfaces.SendMessageProps} key={action.uuid}/>            
        } else if (action.type == "set_language") {
            return <SetLanguageActionComp {...action as Interfaces.SetLanguageProps} key={action.uuid}/>
        }
    }

    setEditing(editing: boolean) {
        this.setState({editing: editing})
    }

    onModalOpen() {
        // console.log('modal open');
    }

    onClick (event: any) {
        if (!this.context.node.state.dragging) {
            this.setEditing(true);
        }
    }

    render() {
        return(
            <div>
                <div className={'action ' + this.actionForm.getClassName()} 
                     onMouseUp={(event)=>{ this.onClick(event); }}>
                    <div className="action-title">
                      {this.actionForm.renderTitle()}
                    </div>
                    <div className="action-content">
                        {this.renderNode()}
                    </div>
                </div>

                <Modal 
                    title={this.actionForm.renderTitle()}
                    className={this.actionForm.getClassName()}
                    show={this.state.editing} 
                    onModalClose={this.onModalClose} 
                    onModalOpen={this.onModalOpen}>

                    <form ref={(ele: any) => { this.form = ele; }}>
                        {this.actionForm.renderForm()}
                    </form>
                </Modal>
            </div>
        )
    }


    
    getType() {
        console.log(this.props.type);
        return this.props.type;
    }
}

export class AddToGroupActionComp extends ActionComp<Interfaces.AddToGroupProps> {
    actionForm: Forms.AddToGroupForm
    constructor(props: Interfaces.AddToGroupProps) {
        super(props);
        this.actionForm = new Forms.AddToGroupForm(props);
    }

    renderNode() { return <div>Add contact to the {this.props.label} group.</div> }
    onModalClose(): void {}
}

export class SaveToContactActionComp extends ActionComp<Interfaces.SaveToContactProps> {
    actionForm: Forms.ActionForm;
    constructor(props: Interfaces.SaveToContactProps) {
        super(props);
        this.actionForm = new Forms.SaveToContactForm(props);
    }
    renderNode() { return <div>Update {this.props.label}.</div> }
    onModalClose(): void {}
}

export class SendMessageActionComp extends ActionComp<Interfaces.SendMessageProps> {
    actionForm: Forms.SendMessageForm;
    constructor(props: Interfaces.SendMessageProps) {
        super(props);
        this.actionForm = new Forms.SendMessageForm(props);
    }

    renderNode() { return <div>{this.props.text}</div>; }

    onModalClose() {
        this.actionForm.submit(this.form, this.context.flow);
        this.setState({ editing: false });
        Plumber.get().repaint(this.context.node.props.uuid);
    }

}

export class SetLanguageActionComp extends ActionComp<Interfaces.SetLanguageProps> {
    actionForm: Forms.ActionForm;
    onModalClose(): void {
        throw new Error('Method not implemented.');
    }
    renderNode() { return <div>Update contact language {this.props.language}.</div>; }
}

export default ActionComp;
