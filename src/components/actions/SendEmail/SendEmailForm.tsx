import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { SendEmail } from '../../../flowTypes';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import { FormProps } from '../../NodeEditor';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement from '../../form/TextInputElement';
import EmailElement from '../../form/EmailElement';

import * as styles from './SendEmail.scss';

export interface SendEmailFormProps extends FormProps {
    action: SendEmail;
    config: Type;
    ComponentMap: ComponentMap;
    updateAction(action: SendEmail): void;
    onBindWidget(ref: any): void;
}

export default class SendEmailForm extends React.Component<SendEmailFormProps> {
    constructor(props: SendEmailFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { emails: emailAddresses } } = widgets.Recipient as EmailElement;
        const { state: { value: subject } } = widgets.Subject as TextInputElement;
        const { state: { value: body } } = widgets.Message as TextInputElement;

        const emails = emailAddresses.map(({ value }) => value);

        const uuid: string = !this.props.action ? generateUUID() : this.props.action.uuid;

        const newAction: SendEmail = {
            uuid,
            type: this.props.config.type,
            body,
            subject,
            emails
        };

        this.props.updateAction(newAction);
    }

    public render(): JSX.Element {
        let emails: string[] = [];
        let subject = '';
        let body = '';

        if (this.props.action && this.props.action.type === 'send_email') {
            ({ emails, subject, body } = this.props.action);
        }

        return (
            <div className={styles.ele}>
                <EmailElement
                    ref={this.props.onBindWidget}
                    name="Recipient"
                    placeholder="To"
                    emails={emails}
                    required={true}
                />
                <TextInputElement
                    __className={styles.subject}
                    ref={this.props.onBindWidget}
                    name="Subject"
                    placeholder="Subject"
                    value={subject}
                    autocomplete={true}
                    required={true}
                    ComponentMap={this.props.ComponentMap}
                />
                <TextInputElement
                    __className={styles.message}
                    ref={this.props.onBindWidget}
                    name="Message"
                    showLabel={false}
                    value={body}
                    autocomplete={true}
                    required={true}
                    textarea={true}
                    ComponentMap={this.props.ComponentMap}
                />
            </div>
        );
    }
}
