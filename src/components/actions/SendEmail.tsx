import * as React from 'react';
import {NodeEditorState} from '../../interfaces';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {SendEmailProps} from '../../interfaces';
import {NodeModalProps} from '../NodeModal';
import {TextAreaElement} from '../form/TextAreaElement';
import {InputElement} from '../form/InputElement';
import {EmailElement} from '../form/EmailElement';



export class SendEmail extends Action<SendEmailProps> {
    renderNode(): JSX.Element {
        return <div>{this.props.subject}</div>
    }
}

interface SendEmailState {
    emails: {label: string, value: string}[]
}

export class SendEmailForm extends NodeForm<SendEmailProps, SendEmailState> {
    
    constructor(props: SendEmailProps) {
        super(props);
    }
    
    renderForm(): JSX.Element {
        var ref = this.ref.bind(this);
        return (
            <div>
                <EmailElement ref={ref} name="Recipient" placeholder="To" emails={this.props.emails} required/>
                <InputElement ref={ref} name="Subject" placeholder="Subject" value={this.props.subject} required/>
                <TextAreaElement ref={ref} name="Message" showLabel={false} value={this.props.body} required/>
            </div>
        )
    }

    submit(modal: NodeModalProps) {

        var eles = this.getElements();
        var emailEle = eles[0] as EmailElement;
        var subjectEle = eles[1] as InputElement;
        var bodyEle = eles[2] as TextAreaElement;

        var emails: string[] = []
        for (let email of emailEle.state.emails) {
            emails.push(email.value);
        }

        modal.onUpdateAction({
            uuid: this.props.uuid, 
            type: "email", 
            body: bodyEle.state.value,
            subject: subjectEle.state.value,
            emails: emails
        } as SendEmailProps);
    }
}