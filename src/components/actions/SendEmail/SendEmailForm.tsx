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

        const newAction: SendEmail = {
            uuid: this.props.action.uuid,
            type: this.props.config.type,
            body,
            subject,
            emails
        };

        this.props.updateAction(newAction);
    }

    public render(): JSX.Element {
        return (
            <div className={styles.ele}>
                <EmailElement
                    ref={this.props.onBindWidget}
                    name="Recipient"
                    placeholder="To"
                    emails={this.props.action.emails}
                    required={true}
                />
                <TextInputElement
                    __className={styles.subject}
                    ref={this.props.onBindWidget}
                    name="Subject"
                    placeholder="Subject"
                    value={this.props.action.subject}
                    autocomplete={true}
                    required={true}
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
                <TextInputElement
                    __className={styles.message}
                    ref={this.props.onBindWidget}
                    name="Message"
                    showLabel={false}
                    value={this.props.action.body}
                    autocomplete={true}
                    required={true}
                    textarea={true}
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
            </div>
        );
    }
}
