import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { ActionFormProps } from 'components/flow/props';
import TaggingElement from 'components/form/select/tags/TaggingElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import {
  FormState,
  mergeForm,
  StringArrayEntry,
  StringEntry,
  ValidationFailure
} from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import { initializeForm, stateToAction } from './helpers';
import styles from './SendEmailForm.module.scss';
import i18n from 'config/i18n';

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

  private handleUpdate(
    keys: { recipients?: string[]; subject?: string; body?: string },
    submitting = false
  ): boolean {
    const updates: Partial<SendEmailFormState> = {};

    if (keys.hasOwnProperty('recipients')) {
      updates.recipients = validate('Recipients', keys.recipients!, [shouldRequireIf(submitting)]);
    }

    if (keys.hasOwnProperty('subject')) {
      updates.subject = validate('Subject', keys.subject!, [shouldRequireIf(submitting)]);
    }

    if (keys.hasOwnProperty('body')) {
      updates.body = validate('Body', keys.body!, [shouldRequireIf(submitting)]);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  public handleSave(): void {
    // validate in case they never updated an empty field
    const valid = this.handleUpdate(
      {
        recipients: this.state.recipients.value,
        subject: this.state.subject.value,
        body: this.state.body.value
      },
      true
    );

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

      // notify our modal we are done
      this.props.onClose(false);
    }
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'Ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  public handleCheckValid(value: string): boolean {
    return EMAIL_PATTERN.test(value) || value.startsWith('@');
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <div className={styles.ele}>
          <TaggingElement
            name={i18n.t('forms.send_email.recipient_name', 'Recipient')}
            placeholder={i18n.t('forms.send_email.recipient_placeholder', 'To')}
            prompt={i18n.t('forms.send_email.recipient_prompt', 'Enter email address')}
            onCheckValid={this.handleCheckValid}
            entry={this.state.recipients}
            onChange={this.handleRecipientsChanged}
            createPrompt={''}
          />
          <TextInputElement
            __className={styles.subject}
            name={i18n.t('forms.send_email.subject_name', 'Subject')}
            placeholder={i18n.t('forms.send_email.subject_placeholder', 'Subject')}
            onChange={this.handleSubjectChanged}
            entry={this.state.subject}
            onFieldFailures={(persistantFailures: ValidationFailure[]) => {
              const subject = { ...this.state.subject, persistantFailures };
              this.setState({
                subject,
                valid: this.state.valid && !hasErrors(subject)
              });
            }}
            autocomplete={true}
          />
          <TextInputElement
            __className={styles.message}
            name={i18n.t('forms.send_email.message_name', 'Message')}
            showLabel={false}
            onChange={this.handleBodyChanged}
            entry={this.state.body}
            onFieldFailures={(persistantFailures: ValidationFailure[]) => {
              const body = { ...this.state.body, persistantFailures };
              this.setState({
                body,
                valid: this.state.valid && !hasErrors(body)
              });
            }}
            autocomplete={true}
            textarea={true}
          />
        </div>
      </Dialog>
    );
  }
}
