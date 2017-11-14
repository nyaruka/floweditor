import * as React from 'react';
import { SendEmail } from '../../../flowTypes';
import { Type } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement from '../../form/TextInputElement';
import EmailElement from '../../form/EmailElement';

const styles = require('./SendEmail.scss');

export interface SendEmailFormProps {
    action: SendEmail;
    onValidCallback: Function;
    type: string;
    ComponentMap: ComponentMap;
    updateAction(action: SendEmail): void;
    onBindWidget(ref: any): void;
    getActionUUID: Function;
}

const SendEmailForm: React.SFC<SendEmailFormProps> = ({
    action,
    onValidCallback,
    type,
    ComponentMap,
    updateAction,
    onBindWidget,
    getActionUUID
}): JSX.Element => {
    onValidCallback((widgets: { [name: string]: any }) => {
        const { state: { emails: emailAddresses } } = widgets['Recipient'] as EmailElement;
        const { state: { value: subject } } = widgets['Subject'] as TextInputElement;
        const { state: { value: body } } = widgets['Message'] as TextInputElement;

        const emails = emailAddresses.map(({ value }) => value);

        const newAction: SendEmail = {
            uuid: getActionUUID(),
            type,
            body,
            subject,
            emails
        };

        updateAction(newAction);
    });

    const renderForm = (): JSX.Element => {
        let emails: string[] = [];
        let subject = '';
        let body = '';

        if (action && action.type == 'send_email') {
            ({ emails } = action);
            ({ subject } = action);
            ({ body } = action);
        }

        return (
            <div className={styles.ele}>
                <EmailElement
                    ref={onBindWidget}
                    name="Recipient"
                    placeholder="To"
                    emails={emails}
                    required
                />
                <TextInputElement
                    className={styles.subject}
                    ref={onBindWidget}
                    name="Subject"
                    placeholder="Subject"
                    value={subject}
                    autocomplete
                    required
                    ComponentMap={ComponentMap}
                />
                <TextInputElement
                    className={styles.message}
                    ref={onBindWidget}
                    name="Message"
                    showLabel={false}
                    value={body}
                    autocomplete
                    required
                    textarea
                    ComponentMap={ComponentMap}
                />
            </div>
        );
    };

    return renderForm();
};

export default SendEmailForm;
