import * as React from 'react';
import {NodeEditorState} from '../../interfaces';
import {ActionComp} from '../ActionComp';
import {NodeFormComp} from '../NodeFormComp';
import {SendMessageProps} from '../../interfaces';

var Select2 = require('react-select2-wrapper');

export class SendMessage extends ActionComp<SendMessageProps> {
    renderNode(): JSX.Element {
        if (this.props.text) {
            return <div>{this.props.text}</div>
        } else {
            return <div className='placeholder'>Send a message to the contact</div>
        }
    }
}

export class SendMessageForm extends NodeFormComp<SendMessageProps, NodeEditorState> {    
    
    renderForm(): JSX.Element {
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
        this.updateAction({
            uuid: this.props.uuid, 
            type: "msg", 
            text: textarea.value,
        } as SendMessageProps);
    }
}