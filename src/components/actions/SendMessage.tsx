import * as React from 'react';
import {Renderer} from '../Renderer'
import * as Interfaces from '../../interfaces';
var Select2 = require('react-select2-wrapper');

export class SendMessage extends Renderer {

    props: Interfaces.SendMessageProps;

    renderNode() {
        if (this.props.text) {
            return <div>{this.props.text}</div>
        } else {
            return <div className='placeholder'>Send a message to the contact</div>
        }
    }
    
    renderForm() { 
        return (
            <div className="form-group">
                <textarea name="message" className="form-control definition" defaultValue={this.props.text}></textarea>
                <div className="error"></div>
            </div>
        )
    }
    
    validate(control: any): string {
        if (control.name == "message") {
            let textarea = control as HTMLTextAreaElement;
            if (textarea.value.trim().length == 0) {
                return "Message content is required";
            }
        }
        return null;
    }

    submit(form: HTMLFormElement) {
        var textarea: HTMLTextAreaElement = $(form).find('textarea')[0] as HTMLTextAreaElement;

        this.props.mutator.updateAction(this.props, {
            uuid: this.props.uuid, 
            type: "msg", 
            text: textarea.value
        });
    }
}

export default SendMessage;