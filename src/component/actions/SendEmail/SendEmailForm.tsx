import * as React from 'react';
import { connect } from 'react-redux';
import { Type } from '../../../config';
import { SendEmail } from '../../../flowTypes';
import { AppState } from '../../../store';
import EmailElement from '../../form/EmailElement';
import TextInputElement from '../../form/TextInputElement';
import { FormProps } from '../../NodeEditor';
import * as styles from './SendEmail.scss';

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
        const { state: { emails: emailAddresses } } = widgets.Recipient;
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

    public render(): JSX.Element {
        return (
            <div className={styles.ele}>
                <EmailElement
                    ref={this.props.onBindWidget}
                    name="Recipient"
                    placeholder="To"
                    emails={this.props.action.addresses}
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
