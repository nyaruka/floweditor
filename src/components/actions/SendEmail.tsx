import * as React from 'react';
import { ActionComp } from '../Action';
import { ActionForm } from '../NodeForm';
import { SendEmail } from '../../FlowDefinition';
import { NodeModalProps } from '../NodeModal';
import { TextInputElement } from '../form/TextInputElement';
import { EmailElement } from '../form/EmailElement';

var styles = require('./SendEmail.scss');

export class SendEmailComp extends ActionComp<SendEmail> {
    renderNode(): JSX.Element {
        return <div>{this.getAction().subject}</div>
    }
}

interface SendEmailState {
    emails: { label: string, value: string }[]
}

export class SendEmailForm extends ActionForm<SendEmail, SendEmailState> {

    renderForm(): JSX.Element {
        var action = this.getAction();
        var ref = this.ref.bind(this);
        return (
            <div className={styles.ele}>
                <EmailElement ref={ref} name="Recipient" placeholder="To" emails={action.emails} required />
                <TextInputElement className={styles.subject} ref={ref} name="Subject" placeholder="Subject" defaultValue={action.subject} autocomplete required />
                <TextInputElement className={styles.message} ref={ref} name="Message" showLabel={false} defaultValue={action.body} autocomplete required textarea />
            </div>
        )
    }

    submit(modal: NodeModalProps) {

        var eles = this.getElements();
        var emailEle = eles[0] as EmailElement;
        var subjectEle = eles[1] as TextInputElement;
        var bodyEle = eles[2] as TextInputElement;

        var emails: string[] = []
        for (let email of emailEle.state.emails) {
            emails.push(email.value);
        }

        var newAction: SendEmail = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            body: bodyEle.state.value,
            subject: subjectEle.state.value,
            emails: emails
        }

        modal.onUpdateAction(newAction);
    }
}