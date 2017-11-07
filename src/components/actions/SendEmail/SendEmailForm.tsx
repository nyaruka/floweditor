import * as React from 'react';
import { ISendEmail } from '../../../flowTypes';
import { TextInputElement } from '../../form/TextInputElement';
import { EmailElement } from '../../form/EmailElement';
import NodeActionForm from '../../NodeEditor/NodeActionForm';
import Widget from '../../NodeEditor/Widget';

const styles = require('./SendEmail.scss');

class SendEmailForm extends NodeActionForm<ISendEmail> {
    renderForm(ref: any): JSX.Element {
        var emails: string[] = [];
        var subject = '';
        var body = '';

        var action = this.getInitial();
        if (action && action.type == 'send_email') {
            emails = action.emails;
            subject = action.subject;
            body = action.body;
        }

        return (
            <div className={styles.ele}>
                <EmailElement
                    ref={ref}
                    name="Recipient"
                    placeholder="To"
                    emails={emails}
                    required
                />
                <TextInputElement
                    className={styles.subject}
                    ref={ref}
                    name="Subject"
                    placeholder="Subject"
                    value={subject}
                    autocomplete
                    required
                    ComponentMap={this.props.ComponentMap}
                />
                <TextInputElement
                    className={styles.message}
                    ref={ref}
                    name="Message"
                    showLabel={false}
                    value={body}
                    autocomplete
                    required
                    textarea
                    ComponentMap={this.props.ComponentMap}
                />
            </div>
        );
    }

    onValid(widgets: { [name: string]: Widget }) {
        var emailEle = widgets['Recipient'] as EmailElement;
        var subjectEle = widgets['Subject'] as TextInputElement;
        var bodyEle = widgets['Message'] as TextInputElement;

        var emails: string[] = [];
        for (let email of emailEle.state.emails) {
            emails.push(email.value);
        }

        var newAction: ISendEmail = {
            uuid: this.getActionUUID(),
            type: this.props.config.type,
            body: bodyEle.state.value,
            subject: subjectEle.state.value,
            emails: emails
        };

        this.props.updateAction(newAction);
    }
}

export default SendEmailForm;
