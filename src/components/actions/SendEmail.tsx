import * as React from 'react';
import { ActionComp } from '../Action';
import { SendEmail } from '../../FlowDefinition';
import { TextInputElement } from '../form/TextInputElement';
import { EmailElement } from '../form/EmailElement';
import { NodeActionForm } from "../NodeEditor";

var styles = require('./SendEmail.scss');

export class SendEmailComp extends ActionComp<SendEmail> {
    renderNode(): JSX.Element {
        return <div>{this.getAction().subject}</div>
    }
}

export class SendEmailForm extends NodeActionForm<SendEmail> {

    renderForm(ref: any): JSX.Element {
        var action = this.getInitial();
        return (
            <div className={styles.ele}>
                <EmailElement ref={ref} name="Recipient" placeholder="To" emails={action.emails} required />
                <TextInputElement className={styles.subject} ref={ref} name="Subject" placeholder="Subject" value={action.subject} autocomplete required />
                <TextInputElement className={styles.message} ref={ref} name="Message" showLabel={false} value={action.body} autocomplete required textarea />
            </div>
        )
    }

    onValid() {

        var emailEle = this.getWidget("Recipient") as EmailElement;
        var subjectEle = this.getWidget("Subject") as TextInputElement;
        var bodyEle = this.getWidget("Message") as TextInputElement;

        var emails: string[] = []
        for (let email of emailEle.state.emails) {
            emails.push(email.value);
        }

        var newAction: SendEmail = {
            uuid: this.getActionUUID(),
            type: this.props.config.type,
            body: bodyEle.state.value,
            subject: subjectEle.state.value,
            emails: emails
        }

        this.props.updateAction(newAction);
    }
}