import * as React from "react";
import * as axios from "axios";
import {ActionProps, AddToGroupProps, SendMessageProps, SaveToContactProps, SetLanguageProps} from '../interfaces'
import ModalComp from './Modal'
var UUID  = require("node-uuid");


export interface ActionState {
    editing: boolean;
}

/**
 * Base Action class for the rendered flow
 */
export class ActionComp<P extends ActionProps> extends React.Component<P, ActionState> {
    
    constructor(props: P) {
        super(props);
        this.state = {
            editing: false
        }
    }

    static createAction(action: ActionProps) {
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
                <ModalComp className={this.getClassName()} title={this.renderTitle()}
                           show={this.state.editing} close={() => this.setEditing(false)}>
                    {this.renderForm()}
                </ModalComp>
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
        return (
            <div>
                <textarea defaultValue={JSON.stringify(this.props, null, 2)}></textarea>
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
}

export class SetLanguageActionComp extends ActionComp<SetLanguageProps> {
    renderTitle() { return <span>Set Language</span>; }
    renderBody() { return <div>Update contact language {this.props.language}.</div>; }
}

export default ActionComp;
