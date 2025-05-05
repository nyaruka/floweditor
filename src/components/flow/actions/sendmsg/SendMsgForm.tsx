/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { react as bindCallbacks } from 'auto-bind';
import { AxiosError, AxiosResponse } from 'axios';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import {
  initializeForm as stateToForm,
  stateToAction,
  TOPIC_OPTIONS
} from 'components/flow/actions/sendmsg/helpers';
import { ActionFormProps } from 'components/flow/props';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import MultiChoiceInput from 'components/form/multichoice/MultiChoice';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { TemplateTranslation } from 'flowTypes';
import mutate from 'immutability-helper';
import * as React from 'react';
import {
  FormState,
  mergeForm,
  StringArrayEntry,
  StringEntry,
  SelectOptionEntry
} from 'store/nodeEditor';
import { MaxOfTenItems, shouldRequireIf, validate } from 'store/validators';

import { hasFeature } from 'config/typeConfigs';
import { FeatureFilter } from 'config/interfaces';

import i18n from 'config/i18n';
import { Trans } from 'react-i18next';
import { Attachment, renderAttachments } from './attachments';
import { TembaComponent } from 'temba/TembaComponent';
import styles from './SendMsgForm.module.scss';
import { MAX_TEXT_LEN } from 'config/interfaces';
import { store } from 'store';
import { TembaAppState } from 'temba-components';

export interface SendMsgFormState extends FormState {
  message: StringEntry;
  quickReplies: StringArrayEntry;
  quickReplyEntry: StringEntry;
  sendAll: boolean;
  attachments: Attachment[];
  uploadInProgress: boolean;
  uploadError: string;
  topic: SelectOptionEntry;
  templateTranslation?: TemplateTranslation;

  // template uuid to dict of component key to array
  template: { uuid: string; name: string };
  templateVariables: string[];

  languageCode: string;
}

export default class SendMsgForm extends React.Component<ActionFormProps, SendMsgFormState> {
  saveAttempted = false;
  private unsubscribe: () => void;

  constructor(props: ActionFormProps) {
    super(props);
    this.state = stateToForm(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });

    // subscribe for changes
    this.unsubscribe = store
      .getApp()
      .subscribe((state: TembaAppState, prevState: TembaAppState) => {
        this.setState({
          languageCode: state.languageCode
        });
      });
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public static contextTypes = {
    config: fakePropType
  };

  private handleUpdate(
    keys: {
      text?: string;
      sendAll?: boolean;
      quickReplies?: string[];
    },
    submitting = false
  ): boolean {
    const updates: Partial<SendMsgFormState> = {};
    if (keys.hasOwnProperty('text')) {
      updates.message = validate(i18n.t('forms.message', 'Message'), keys.text, [
        shouldRequireIf(submitting)
      ]);
    }

    if (keys.hasOwnProperty('sendAll')) {
      updates.sendAll = keys.sendAll;
    }

    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = validate(
        i18n.t('forms.quick_replies', 'Quick Replies'),
        keys.quickReplies,
        [MaxOfTenItems]
      );
    }

    const updated = mergeForm(this.state, updates) as SendMsgFormState;

    this.setState(updated);
    return updated.valid;
  }

  public handleMessageInput(event: React.KeyboardEvent) {
    return this.handleUpdate({ text: (event.target as any).value }, false);
  }

  public handleMessageUpdate(message: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ text: message }, submitting);
  }

  public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
    return this.handleUpdate({ quickReplies });
  }

  public handleSendAllUpdate(sendAll: boolean): boolean {
    return this.handleUpdate({ sendAll });
  }

  private hasTemplateErrors(): boolean {
    // if there is an attachment variable, make sure it's not empty
    const { templateVariables, templateTranslation } = this.state;
    if (templateTranslation && templateVariables && templateTranslation.variables.length > 0) {
      const hasMissingAttachment = !!templateTranslation.variables.find(
        (variable: any, index: number) => {
          if (
            variable.type === 'image' ||
            variable.type === 'document' ||
            variable.type === 'video' ||
            variable.type === 'audio'
          ) {
            if (templateVariables[index] === '') {
              return true;
            }
          }
          return false;
        }
      );
      if (hasMissingAttachment) {
        return true;
      }
    }
    return false;
  }

  private handleSave(): void {
    this.saveAttempted = true;

    // don't continue if our message already has errors
    if (hasErrors(this.state.message)) {
      return;
    }

    // make sure we validate untouched text fields and contact fields
    let valid = this.handleMessageUpdate(this.state.message.value, null, true);
    valid = valid && !hasErrors(this.state.quickReplyEntry) && !this.hasTemplateErrors();

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

      // if we had a template and it doen't match our new template
      if (this.props.nodeSettings.originalAction) {
        const originalTemplate = (this.props.nodeSettings.originalAction as any).template;
        if (originalTemplate) {
          if (
            (this.state.template && this.state.template.uuid !== originalTemplate.uuid) ||
            !this.state.template
          ) {
            this.props.removeLocalizations(this.props.nodeSettings.originalAction.uuid, [
              'template_variables'
            ]);
          }
        }
      }

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

  private handleTemplateChanged(event: any): void {
    const { template, translation, variables } = event.detail;
    this.setState({
      template: template ? { uuid: template.uuid, name: template.name } : null,
      templateVariables: variables,
      templateTranslation: translation
    });
  }

  private handleTemplateVariableChanged(event: any): void {
    this.setState({ templateVariables: event.detail.variables });
  }

  private renderTopicConfig(): JSX.Element {
    return (
      <>
        <p>
          <temba-alert level="error">
            {i18n.t(
              'forms.send_msg_facebook_warning',
              'Using Facebook topics in flow messages is deprecated and will be removed on March 1, 2025. To message Facebook contacts outside of their 24 hour messaging window, use a Broadcast with a Facebook Opt-In instead of a Flow. Learn more about Facebook Opt-ins in our Help Center.'
            )}
          </temba-alert>
        </p>
        <SelectElement
          key={'fb_method_select'}
          name={i18n.t('forms.method', 'Method')}
          entry={this.state.topic}
          onChange={this.handleTopicUpdate}
          options={TOPIC_OPTIONS}
          placeholder={i18n.t(
            'forms.send_msg_facebook_topic_placeholder',
            'Select a topic to use over Facebook'
          )}
          clearable={true}
        />
      </>
    );
  }

  private handleTopicUpdate(topic: SelectOption) {
    this.setState({ topic: { value: topic } });
  }

  private renderTemplateConfig(): JSX.Element {
    const uuid = this.state.template ? this.state.template.uuid : null;
    return (
      <>
        <p>
          {i18n.t(
            'forms.whatsapp_warning',
            'Sending messages over a WhatsApp channel requires that a template be used if you have not received a message from a contact in the last 24 hours. Setting a template to use over WhatsApp is especially important for the first message in your flow.'
          )}
        </p>
        <TembaComponent
          style={{
            '--color-widget-border':
              this.saveAttempted && this.hasTemplateErrors() ? 'var(--color-error)' : 'inherit'
          }}
          tag="temba-template-editor"
          eventHandlers={{
            'temba-context-changed': this.handleTemplateChanged,
            'temba-content-changed': this.handleTemplateVariableChanged
          }}
          template={uuid}
          url={this.props.assetStore.templates.endpoint}
          variables={JSON.stringify(this.state.templateVariables)}
          lang={
            this.state.languageCode
              ? this.state.languageCode !== 'base'
                ? this.state.languageCode
                : null
              : null
          }
        ></TembaComponent>
      </>
    );
  }

  private handleAttachmentUploading(isUploading: boolean) {
    const uploadError = '';
    this.setState({ uploadError });

    if (isUploading) {
      const uploadInProgress = true;
      this.setState({ uploadInProgress });
    } else {
      const uploadInProgress = false;
      this.setState({ uploadInProgress });
    }
  }

  private handleAttachmentUploaded(response: AxiosResponse) {
    //django returns a 200 even when there's an error
    if (response.data && response.data.error) {
      const uploadError: string = response.data.error;
      this.setState({ uploadError });
    } else {
      const attachments: any = mutate(this.state.attachments, {
        $push: [{ type: response.data.type, url: response.data.url, uploaded: true }]
      });
      this.setState({ attachments });
      const uploadError = '';
      this.setState({ uploadError });
    }

    const uploadInProgress = false;
    this.setState({ uploadInProgress });
  }

  private handleAttachmentUploadFailed(error: AxiosError) {
    //nginx returns a 300+ if there's an error
    let uploadError = '';
    const status = error.response.status;
    if (status >= 500) {
      uploadError = i18n.t('file_upload_failed_generic', 'File upload failed, please try again');
    } else if (status === 413) {
      uploadError = i18n.t('file_upload_failed_max_limit', 'Limit for file uploads is 25 MB');
    } else {
      uploadError = error.response.statusText;
    }
    this.setState({ uploadError });

    const uploadInProgress = false;
    this.setState({ uploadInProgress });
  }

  private handleAttachmentChanged(index: number, type: string, url: string) {
    this.handleAttachmentUploading(false);

    let attachments: any = this.state.attachments;
    if (index === -1) {
      attachments = mutate(attachments, {
        $push: [{ type, url }]
      });
    } else {
      attachments = mutate(attachments, {
        [index]: {
          $set: { type, url }
        }
      });
    }

    this.setState({ attachments });
  }

  private handleAttachmentRemoved(index: number) {
    const attachments: any = mutate(this.state.attachments, {
      $splice: [[index, 1]]
    });
    this.setState({ attachments });
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const quickReplies: Tab = {
      name: i18n.t('forms.quick_replies', 'Quick Replies'),
      body: (
        <>
          <p>
            {i18n.t(
              'forms.quick_replies_summary',
              'Quick Replies are made into buttons for supported channels. For example, when asking a question, you might add a Quick Reply for "Yes" and one for "No".'
            )}
          </p>

          <MultiChoiceInput
            name={i18n.t('forms.quick_reply', 'quick_reply')}
            helpText={
              <Trans i18nKey="forms.add_quick_reply">Add a new Quick Reply and press enter.</Trans>
            }
            items={this.state.quickReplies}
            entry={this.state.quickReplyEntry}
            onChange={this.handleQuickRepliesUpdate}
            maxItems={10}
            maxItemsText="You can only add 10 Quick Replies"
          />
        </>
      ),
      checked: this.state.quickReplies.value.length > 0,
      hasErrors: hasErrors(this.state.quickReplyEntry)
    };

    const attachments: Tab = {
      name: i18n.t('forms.attachments', 'Attachments'),
      body: renderAttachments(
        this.context.config.endpoints.attachments,
        this.state.attachments,
        this.state.uploadInProgress,
        this.state.uploadError,
        this.handleAttachmentUploading,
        this.handleAttachmentUploaded,
        this.handleAttachmentUploadFailed,
        this.handleAttachmentChanged,
        this.handleAttachmentRemoved
      ),
      checked: this.state.attachments.length > 0
    };

    const advanced: Tab = {
      name: i18n.t('forms.advanced', 'Advanced'),
      body: (
        <CheckboxElement
          name={i18n.t('forms.all_destinations', 'All Destinations')}
          title={i18n.t('forms.all_destinations', 'All Destinations')}
          checked={this.state.sendAll}
          description={i18n.t(
            'forms.all_destinations_description',
            "Send a message to all destinations known for this contact. If you aren't sure what this means, leave it unchecked."
          )}
          onChange={this.handleSendAllUpdate}
        />
      ),
      checked: this.state.sendAll
    };

    const tabs = [quickReplies, attachments, advanced];

    if (hasFeature(this.context.config, FeatureFilter.HAS_WHATSAPP)) {
      const templates: Tab = {
        name: 'WhatsApp',
        body: this.renderTemplateConfig(),
        checked: this.state.template !== null,
        hasErrors: this.hasTemplateErrors()
      };
      tabs.splice(0, 0, templates);
    }

    if (hasFeature(this.context.config, FeatureFilter.HAS_FACEBOOK)) {
      const templates: Tab = {
        name: 'Facebook',
        body: this.renderTopicConfig(),
        checked: this.state.topic.value != null
      };
      tabs.splice(0, 0, templates);
    }

    tabs.reverse();

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <TextInputElement
          __className={styles.message}
          name={i18n.t('forms.message', 'Message')}
          showLabel={false}
          counter=".sms-counter"
          onChange={this.handleMessageUpdate}
          entry={this.state.message}
          autocomplete={true}
          focus={true}
          textarea={true}
          maxLength={MAX_TEXT_LEN}
        />
        <temba-charcount class="sms-counter"></temba-charcount>
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
