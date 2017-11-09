import * as React from 'react';
import { ISendEmail } from '../../../flowTypes';
import { IType } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import { TextInputElement } from '../../form/TextInputElement';
import { EmailElement } from '../../form/EmailElement';
import Widget from '../../NodeEditor/Widget';

const styles = require('./SendEmail.scss');

export interface ISendEmailFormProps {
    validationCallback: Function;
    config: IType;
    getInitialAction(): ISendEmail;
    ComponentMap: ComponentMap;
    updateAction(action: ISendEmail): void;
    onBindWidget(ref: any): void;
    getActionUUID: Function;
}

export default ({
    validationCallback,
    config,
    getInitialAction,
    ComponentMap,
    updateAction,
    onBindWidget,
    getActionUUID
}: ISendEmailFormProps): JSX.Element => {
    validationCallback((widgets: { [name: string]: Widget }) => {
        const emailEle = widgets['Recipient'] as EmailElement;
        const subjectEle = widgets['Subject'] as TextInputElement;
        const bodyEle = widgets['Message'] as TextInputElement;

        let emails: string[] = [];

        emailEle.state.emails.forEach(({ value }) => {
            emails = [...emails, value];
        });

        const newAction: ISendEmail = {
            uuid: getActionUUID(),
            type: config.type,
            body: bodyEle.state.value,
            subject: subjectEle.state.value,
            emails: emails
        };

        updateAction(newAction);
    });

    const renderForm = (): JSX.Element => {
        let emails: string[] = [];
        let subject = '';
        let body = '';

        const initialAction = getInitialAction();

        if (initialAction && initialAction.type == 'send_email') {
            ({ emails } = initialAction);
            ({ subject } = initialAction);
            ({ body } = initialAction);
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
