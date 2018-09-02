import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { initializeForm, stateToAction } from '~/components/flow/actions/sendemail/helpers';
import * as styles from '~/components/flow/actions/sendemail/SendEmail.scss';
import { ActionFormProps } from '~/components/flow/props';
import TaggingElement from '~/components/form/select/tags/TaggingElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { FormState, mergeForm, StringArrayEntry, StringEntry } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export interface SendEmailFormState extends FormState {
    recipients: StringArrayEntry;
    subject: StringEntry;
    body: StringEntry;
}

export default class SendEmailForm extends React.Component<ActionFormProps, SendEmailFormState> {
    constructor(props: ActionFormProps) {
        super(props);

        this.state = initializeForm(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleRecipientsChanged(recipients: string[]): boolean {
        return this.handleUpdate({ recipients });
    }

    public handleSubjectChanged(subject: string): boolean {
        return this.handleUpdate({ subject });
    }

    public handleBodyChanged(body: string): boolean {
        return this.handleUpdate({ body });
    }

    private handleUpdate(keys: {
        recipients?: string[];
        subject?: string;
        body?: string;
    }): boolean {
        const updates: Partial<SendEmailFormState> = {};

        if (keys.hasOwnProperty('recipients')) {
            updates.recipients = validate('Recipients', keys.recipients, [validateRequired]);
        }

        if (keys.hasOwnProperty('subject')) {
            updates.subject = validate('Subject', keys.subject, [validateRequired]);
        }

        if (keys.hasOwnProperty('body')) {
            updates.body = validate('Body', keys.body, [validateRequired]);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleSave(): void {
        // validate in case they never updated an empty field
        const valid = this.handleUpdate({
            recipients: this.state.recipients.value,
            subject: this.state.subject.value,
            body: this.state.body.value
        });

        if (valid) {
            this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

            // notify our modal we are done
            this.props.onClose(false);
        }
    }

    public getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public handleCheckValid(value: string): boolean {
        return EMAIL_PATTERN.test(value);
    }

    public render(): JSX.Element {
        const typeConfig = this.props.typeConfig;
        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <div className={styles.ele}>
                    <TaggingElement
                        name="Recipient"
                        placeholder="To"
                        prompt="Enter e-mail address"
                        onCheckValid={this.handleCheckValid}
                        entry={this.state.recipients}
                        onChange={this.handleRecipientsChanged}
                    />
                    <TextInputElement
                        __className={styles.subject}
                        name="Subject"
                        placeholder="Subject"
                        onChange={this.handleSubjectChanged}
                        entry={this.state.subject}
                        autocomplete={true}
                    />
                    <TextInputElement
                        __className={styles.message}
                        name="Message"
                        showLabel={false}
                        onChange={this.handleBodyChanged}
                        entry={this.state.body}
                        autocomplete={true}
                        textarea={true}
                    />
                </div>
            </Dialog>
        );
    }
}
