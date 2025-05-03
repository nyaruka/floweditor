/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import styles from 'components/flow/actions/action/Action.module.scss';
import { determineTypeConfig } from 'components/flow/helpers';
import { LocalizationFormProps } from 'components/flow/props';
import MultiChoiceInput from 'components/form/multichoice/MultiChoice';
import TextInputElement from 'components/form/textinput/TextInputElement';
import UploadButton from 'components/uploadbutton/UploadButton';
import { fakePropType } from 'config/ConfigProvider';
import { SendMsg } from 'flowTypes';
import * as React from 'react';
import mutate from 'immutability-helper';
import { FormState, mergeForm, StringArrayEntry, StringEntry } from 'store/nodeEditor';
import { MaxOfTenItems, validate } from 'store/validators';

import { initializeLocalizedForm } from './helpers';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';
import { renderIssues } from '../helpers';
import { Attachment, renderAttachments } from '../sendmsg/attachments';
import { AxiosError, AxiosResponse } from 'axios';
import { TembaComponent } from 'temba/TembaComponent';
import { MAX_QUICK_REPLIES, MAX_TEXT_LEN } from 'config/interfaces';
import { store } from 'store';

export interface MsgLocalizationFormState extends FormState {
  message: StringEntry;
  quickReplies: StringArrayEntry;
  audio: StringEntry;
  template?: { uuid: string; name: string };
  templateVariables: string[];
  attachments: Attachment[];
  uploadInProgress: boolean;
  uploadError: string;
}

export default class MsgLocalizationForm extends React.Component<
  LocalizationFormProps,
  MsgLocalizationFormState
> {
  constructor(props: LocalizationFormProps) {
    super(props);
    this.state = initializeLocalizedForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });
  }

  public static contextTypes = {
    config: fakePropType
  };

  public handleMessageUpdate(text: string): boolean {
    return this.handleUpdate({ text });
  }

  public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
    return this.handleUpdate({ quickReplies });
  }

  private handleAudioChanged(url: string): void {
    this.handleUpdate({ audio: url });
  }

  private handleUpdate(keys: {
    text?: string;
    sendAll?: boolean;
    quickReplies?: string[];
    audio?: string;
  }): boolean {
    const updates: Partial<MsgLocalizationFormState> = {};

    if (keys.hasOwnProperty('text')) {
      updates.message = validate(i18n.t('forms.message', 'Message'), keys.text!, []);
    }

    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = validate(
        i18n.t('forms.quick_replies', 'Quick Replies'),
        keys.quickReplies!,
        [MaxOfTenItems]
      );
    }

    if (keys.hasOwnProperty('audio')) {
      updates.audio! = { value: keys.audio! };
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);

    return updated.valid;
  }

  private handleSave(): void {
    const { message: text, quickReplies, audio, attachments, templateVariables } = this.state;

    // make sure we are valid for saving, only quick replies can be invalid
    const typeConfig = determineTypeConfig(this.props.nodeSettings);
    const valid =
      typeConfig.localizeableKeys!.indexOf('quick_replies') > -1
        ? this.handleQuickRepliesUpdate(this.state.quickReplies.value)
        : true;

    if (valid) {
      const translations: any = {};
      if (text.value) {
        translations.text = text.value;
      }

      translations.attachments = attachments
        .filter((attachment: Attachment) => attachment.url.trim().length > 0)
        .map((attachment: Attachment) => `${attachment.type}:${attachment.url}`);

      if (quickReplies.value && quickReplies.value.length > 0) {
        translations.quick_replies = quickReplies.value;
      }

      if (audio.value) {
        translations.audio_url = audio.value;
      }

      if (templateVariables) {
        translations.template_variables = templateVariables;
      }

      const localizations = [
        {
          uuid: this.props.nodeSettings.originalAction!.uuid,
          translations
        }
      ];
      this.props.updateLocalizations(store.getState().languageCode, localizations);

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

  private handleQuickReplyChanged(quickReplies: string[]): void {
    this.handleUpdate({ quickReplies });
  }

  private handleTemplateVariableChanged(event: any): void {
    this.setState({ templateVariables: event.detail.variables });
  }

  private handleAttachmentUploading(isUploading: boolean) {
    const uploadError = '';
    console.log(uploadError);
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
      console.log(uploadError);
      this.setState({ uploadError });
    } else {
      const attachments: any = mutate(this.state.attachments, {
        $push: [{ type: response.data.type, url: response.data.url, uploaded: true }]
      });
      this.setState({ attachments });

      const uploadError = '';
      console.log(uploadError);
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
    const typeConfig = determineTypeConfig(this.props.nodeSettings);
    const tabs: Tab[] = [];

    if (typeConfig.localizeableKeys!.indexOf('quick_replies') > -1) {
      tabs.push({
        name: i18n.t('forms.quick_replies', 'Quick Replies'),
        body: (
          <>
            <MultiChoiceInput
              name={i18n.t('forms.quick_reply', 'Quick Reply')}
              helpText={
                <Trans
                  i18nKey="forms.localized_quick_replies"
                  values={{ language: store.getState().getLanguage().name }}
                >
                  Add a new [[language]] Quick Reply and press enter.
                </Trans>
              }
              items={this.state.quickReplies}
              onChange={this.handleQuickReplyChanged}
              maxItems={MAX_QUICK_REPLIES}
              maxItemsText={`You can only add ${MAX_QUICK_REPLIES} quick replies`}
            />
          </>
        ),
        checked: this.state.quickReplies.value.length > 0
      });
    }

    if (typeConfig.localizeableKeys!.indexOf('quick_replies') > -1) {
      tabs.push({
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
      });
    }

    let audioButton: JSX.Element | null = null;
    if (typeConfig.localizeableKeys!.indexOf('audio_url') > 0) {
      audioButton = (
        <UploadButton
          icon="recording"
          uploadText="Upload Recording"
          removeText="Remove Recording"
          url={this.state.audio.value}
          endpoint={this.context.config.endpoints.attachments}
          onUploadChanged={this.handleAudioChanged}
        />
      );
    }

    if (this.state.template && this.state.templateVariables.length > 0) {
      tabs.push({
        name: 'WhatsApp',
        body: (
          <>
            <p>
              {i18n.t(
                'forms.whatsapp_warning',
                'Sending messages over a WhatsApp channel requires that a template be used if you have not received a message from a contact in the last 24 hours. Setting a template to use over WhatsApp is especially important for the first message in your flow.'
              )}
            </p>
            {this.state.template ? (
              <TembaComponent
                tag="temba-template-editor"
                eventHandlers={{
                  'temba-content-changed': this.handleTemplateVariableChanged
                }}
                template={this.state.template.uuid}
                url={this.props.assetStore.templates.endpoint}
                lang={store.getState().languageCode}
                variables={JSON.stringify(this.state.templateVariables)}
                translating={true}
              ></TembaComponent>
            ) : null}
          </>
        ),
        checked: this.state.templateVariables.length > 0
      });
    }

    const translation = i18n.t('forms.translation', 'Translation');
    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <div data-spec="translation-container">
          <div data-spec="text-to-translate" className={styles.translate_from}>
            {(this.props.nodeSettings.originalAction as SendMsg).text}
          </div>
        </div>

        <TextInputElement
          name={i18n.t('forms.message', 'Message')}
          __className={styles.message}
          showLabel={false}
          onChange={this.handleMessageUpdate}
          entry={this.state.message}
          placeholder={`${store.getState().getLanguage().name} ${translation}`}
          autocomplete={true}
          focus={true}
          textarea={true}
          maxLength={MAX_TEXT_LEN}
        />

        {audioButton}
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
