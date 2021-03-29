import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import styles from 'components/flow/actions/action/Action.module.scss';
import { determineTypeConfig } from 'components/flow/helpers';
import { LocalizationFormProps } from 'components/flow/props';
import MultiChoiceInput from 'components/form/multichoice/MultiChoice';
import TextInputElement from 'components/form/textinput/TextInputElement';
import UploadButton from 'components/uploadbutton/UploadButton';
import { fakePropType } from 'config/ConfigProvider';
import { SendMsg, MsgTemplating } from 'flowTypes';
import * as React from 'react';
import mutate from 'immutability-helper';
import { FormState, mergeForm, StringArrayEntry, StringEntry } from 'store/nodeEditor';
import { MaxOfTenItems, validate } from 'store/validators';

import { initializeLocalizedForm } from './helpers';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';
import { range } from 'utils';
import { renderIssues } from '../helpers';
import { Attachment, renderAttachments } from '../sendmsg/attachments';
import { AxiosResponse } from 'axios';

export interface MsgLocalizationFormState extends FormState {
  message: StringEntry;
  quickReplies: StringArrayEntry;
  audio: StringEntry;
  templateVariables: StringEntry[];
  templating: MsgTemplating;
  attachments: Attachment[];
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
    const { message: text, quickReplies, audio, templateVariables, attachments } = this.state;

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

      const localizations = [
        {
          uuid: this.props.nodeSettings.originalAction!.uuid,
          translations
        }
      ];

      // if we have template variables, they show up on their own key
      const hasTemplateVariables = templateVariables.find(
        (entry: StringEntry) => entry.value.length > 0
      );
      if (hasTemplateVariables) {
        localizations.push({
          uuid: this.state.templating.uuid,
          translations: { variables: templateVariables.map((entry: StringEntry) => entry.value) }
        });
      }

      this.props.updateLocalizations(this.props.language.id, localizations);

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

  private handleTemplateVariableChanged(updatedText: string, num: number): void {
    const entry = validate(`Variable ${num + 1}`, updatedText, []);

    const templateVariables = mutate(this.state.templateVariables, {
      $merge: { [num]: entry }
    }) as StringEntry[];

    this.setState({ templateVariables });
  }

  private handleAttachmentUploaded(response: AxiosResponse) {
    const attachments: any = mutate(this.state.attachments, {
      $push: [{ type: response.data.type, url: response.data.url, uploaded: true }]
    });
    this.setState({ attachments });
  }

  private handleAttachmentChanged(index: number, type: string, url: string) {
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

    if (
      this.state.templating &&
      typeConfig.localizeableKeys!.indexOf('templating.variables') > -1
    ) {
      const hasLocalizedValue = !!this.state.templateVariables.find(
        (entry: StringEntry) => entry.value.length > 0
      );

      const variable = i18n.t('forms.variable', 'Variable');

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
            {this.state.templating && this.state.templating.variables.length > 0 ? (
              <>
                {range(0, this.state.templating.variables.length).map((num: number) => {
                  const entry = this.state.templateVariables[num] || { value: '' };
                  return (
                    <div className={styles.variable} key={'tr_arg_' + num}>
                      <TextInputElement
                        name={`${i18n.t('forms.variable', 'Variable')} ${num + 1}`}
                        showLabel={false}
                        placeholder={`${this.props.language.name} ${variable} ${num + 1}`}
                        onChange={(updatedText: string) => {
                          this.handleTemplateVariableChanged(updatedText, num);
                        }}
                        entry={entry}
                        autocomplete={true}
                      />
                    </div>
                  );
                })}
              </>
            ) : null}
          </>
        ),
        checked: hasLocalizedValue
      });
    }

    if (typeConfig.localizeableKeys!.indexOf('quick_replies') > -1) {
      tabs.push({
        name: i18n.t('forms.attachments', 'Attachments'),
        body: renderAttachments(
          this.context.config.endpoints.attachments,
          this.state.attachments,
          this.handleAttachmentUploaded,
          this.handleAttachmentChanged,
          this.handleAttachmentRemoved
        ),
        checked: this.state.attachments.length > 0
      });
    }

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
                  values={{ language: this.props.language.name }}
                >
                  Add a new [[language]] Quick Reply and press enter.
                </Trans>
              }
              items={this.state.quickReplies}
              onChange={this.handleQuickReplyChanged}
            />
          </>
        ),
        checked: this.state.quickReplies.value.length > 0
      });
    }

    let audioButton: JSX.Element | null = null;
    if (typeConfig.localizeableKeys!.indexOf('audio_url') > 0) {
      audioButton = (
        <UploadButton
          icon="fe-mic"
          uploadText="Upload Recording"
          removeText="Remove Recording"
          url={this.state.audio.value}
          endpoint={this.context.config.endpoints.attachments}
          onUploadChanged={this.handleAudioChanged}
        />
      );
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
          showLabel={false}
          onChange={this.handleMessageUpdate}
          entry={this.state.message}
          placeholder={`${this.props.language.name} ${translation}`}
          autocomplete={true}
          focus={true}
          textarea={true}
        />

        {audioButton}
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
