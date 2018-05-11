import * as React from 'react';
import { connect } from 'react-redux';

import { Type } from '../../../config';
import { SendEmail } from '../../../flowTypes';
import { AppState } from '../../../store';
import TaggingElement from '../../form/TaggingElement/TaggingElement';
import TextInputElement from '../../form/TextInputElement';
import * as styles from './SendEmail.scss';

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export interface SendEmailFormStoreProps {
    typeConfig: Type;
}

export interface SendEmailFormPassedProps {
    action: SendEmail;
    updateAction(action: SendEmail): void;
    onBindWidget(ref: any): void;
}

export type SendEmailFormProps = SendEmailFormStoreProps & SendEmailFormPassedProps;

export class SendEmailForm extends React.Component<SendEmailFormProps> {
    constructor(props: SendEmailFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { tags: emailAddresses } } = widgets.Recipient;
        const { wrappedInstance: { state: { value: subject } } } = widgets.Subject;
        const { wrappedInstance: { state: { value: body } } } = widgets.Message;

        const addresses = emailAddresses.map(
            ({ value }: { label: string; value: string }) => value
        );

        const newAction: SendEmail = {
            uuid: this.props.action.uuid,
            type: this.props.typeConfig.type,
            body,
            subject,
            addresses
        };

        this.props.updateAction(newAction);
    }

    private handleValidPrompt(value: string): string {
        return `Send email to ${value}`;
    }

    private handleCheckValid(value: string): boolean {
        return EMAIL_PATTERN.test(value);
    }

    public render(): JSX.Element {
        return (
            <div className={styles.ele}>
                <TaggingElement
                    ref={this.props.onBindWidget}
                    name="Recipient"
                    placeholder="To"
                    prompt="Enter e-mail address"
                    onCheckValid={this.handleCheckValid}
                    onValidPrompt={this.handleValidPrompt}
                    tags={this.props.action.addresses || []}
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
                />
            </div>
        );
    }
}

const mapStateToProps = ({ nodeEditor: { typeConfig } }: AppState) => ({ typeConfig });

const ConnectedSendEmailForm = connect(mapStateToProps, null, null, { withRef: true })(
    SendEmailForm
);

export default ConnectedSendEmailForm;
