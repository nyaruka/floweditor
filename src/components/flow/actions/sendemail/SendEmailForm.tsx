import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TaggingElement from '~/components/form/taggingelement/TaggingElement';
import TextInputElement from '~/components/form/textinputelement/TextInputElement';
import { Type } from '~/config';
import { SendEmail } from '~/flowTypes';
import { AppState, DispatchWithState } from '~/store';
import { SendEmailFunc, updateSendEmailForm } from '~/store/forms';
import { SendEmailFormState } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

import * as styles from './SendEmail.scss';
import { SendEmailFormHelper } from './SendEmailFormHelper';

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export interface SendEmailFormStoreProps {
    typeConfig: Type;
    form: SendEmailFormState;
    updateSendEmailForm: SendEmailFunc;
}

export interface SendEmailFormPassedProps {
    action: SendEmail;
    updateAction(action: SendEmail): void;
    formHelper: SendEmailFormHelper;
}

export type SendEmailFormProps = SendEmailFormStoreProps & SendEmailFormPassedProps;

export class SendEmailForm extends React.Component<SendEmailFormProps> {
    constructor(props: SendEmailFormProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public onValid(): void {
        const updated = this.props.formHelper.stateToAction(
            this.props.action.uuid,
            this.props.form
        );
        this.props.updateAction(updated);
    }

    public validate(): boolean {
        let valid = this.handleRecipientsChanged(this.props.form.recipients.value);
        valid = this.handleSubjectChanged(this.props.form.subject.value) && valid;
        return this.handleBodyChanged(this.props.form.body.value) && valid;
    }

    private handleUpdateForm(updates: Partial<SendEmailFormState>): boolean {
        return (this.props.updateSendEmailForm(updates) as any).valid;
    }

    private handleRecipientsChanged(recipients: string[]): boolean {
        return this.handleUpdateForm({
            recipients: validate('Recipients', recipients, [validateRequired])
        });
    }

    private handleSubjectChanged(subject: string): boolean {
        return this.handleUpdateForm({
            subject: validate('Subject', subject, [validateRequired])
        });
    }

    private handleBodyChanged(body: string): boolean {
        return this.handleUpdateForm({
            body: validate('Body', body, [validateRequired])
        });
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
                    name="Recipient"
                    placeholder="To"
                    prompt="Enter e-mail address"
                    onCheckValid={this.handleCheckValid}
                    onValidPrompt={this.handleValidPrompt}
                    entry={this.props.form.recipients}
                    onChange={this.handleRecipientsChanged}
                />
                <TextInputElement
                    __className={styles.subject}
                    name="Subject"
                    placeholder="Subject"
                    onChange={this.handleSubjectChanged}
                    entry={this.props.form.subject}
                    autocomplete={true}
                />
                <TextInputElement
                    __className={styles.message}
                    name="Message"
                    showLabel={false}
                    onChange={this.handleBodyChanged}
                    entry={this.props.form.body}
                    autocomplete={true}
                    textarea={true}
                />
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({ nodeEditor: { form, typeConfig } }: AppState) => ({ form, typeConfig });

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSendEmailForm }, dispatch);

const ConnectedSendEmailForm = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        withRef: true
    }
)(SendEmailForm);

export default ConnectedSendEmailForm;
