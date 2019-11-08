import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import styles from 'components/flow/actions/action/Action.module.scss';
import { hasErrors } from 'components/flow/actions/helpers';
import { determineTypeConfig } from 'components/flow/helpers';
import { LocalizationFormProps } from 'components/flow/props';
import MultiChoiceInput from 'components/form/multichoice/MultiChoice';
import TextInputElement from 'components/form/textinput/TextInputElement';
import UploadButton from 'components/uploadbutton/UploadButton';
import { fakePropType } from 'config/ConfigProvider';
import { SendMsg } from 'flowTypes';
import * as React from 'react';
import {
  FormState,
  mergeForm,
  StringArrayEntry,
  StringEntry,
  ValidationFailure
} from 'store/nodeEditor';
import { MaxOfTenItems, validate } from 'store/validators';

import { initializeLocalizedForm } from './helpers';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';

export interface MsgLocalizationFormState extends FormState {
  message: StringEntry;
  quickReplies: StringArrayEntry;
  audio: StringEntry;
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
      updates.message = validate('Message', keys.text!, []);
    }

    if (keys.hasOwnProperty('quickReplies')) {
      updates.quickReplies = validate('Quick Replies', keys.quickReplies!, [MaxOfTenItems]);
    }

    if (keys.hasOwnProperty('audio')) {
      updates.audio! = { value: keys.audio! };
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);

    return updated.valid;
  }

  private handleSave(): void {
    const { message: text, quickReplies, audio } = this.state;

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

      if (quickReplies.value && quickReplies.value.length > 0) {
        translations.quick_replies = quickReplies.value;
      }

      if (audio.value) {
        translations.audio_url = audio.value;
      }

      this.props.updateLocalizations(this.props.language.id, [
        {
          uuid: this.props.nodeSettings.originalAction!.uuid,
          translations
        }
      ]);

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

  private handleAddQuickReply(newQuickReply: string): boolean {
    const newReplies = [...this.state.quickReplies.value];
    if (newReplies.length >= 10) {
      return false;
    }

    // we don't allow two quick replies with the same name
    const isNew = !newReplies.find(
      (reply: string) => reply.toLowerCase() === newQuickReply.toLowerCase()
    );

    if (isNew) {
      newReplies.push(newQuickReply);
      this.setState({
        quickReplies: { value: newReplies }
      });
      return true;
    }

    return false;
  }

  private handleRemoveQuickReply(toRemove: string): void {
    this.setState({
      quickReplies: {
        value: this.state.quickReplies.value.filter((reply: string) => reply !== toRemove)
      }
    });
  }

  public handleQuickReplyFieldFailures(persistantFailures: ValidationFailure[]): void {
    const quickReplies = { ...this.state.quickReplies, persistantFailures };
    this.setState({
      quickReplies,
      valid: this.state.valid && !hasErrors(quickReplies)
    });
  }

  public render(): JSX.Element {
    const typeConfig = determineTypeConfig(this.props.nodeSettings);
    const tabs: Tab[] = [];

    if (typeConfig.localizeableKeys!.indexOf('quick_replies') > -1) {
      tabs.push({
        name: 'Quick Replies',
        body: (
          <>
            <MultiChoiceInput
              name="Quick Reply"
              helpText={
                <Trans
                  i18nKey="forms.send_msg.localized_quick_replies"
                  values={{ language: this.props.language.name }}
                >
                  Add a new [[language]] Quick Reply and press enter.
                </Trans>
              }
              items={this.state.quickReplies}
              onRemoved={this.handleRemoveQuickReply}
              onItemAdded={this.handleAddQuickReply}
              onFieldErrors={this.handleQuickReplyFieldFailures}
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
          name="Message"
          showLabel={false}
          onChange={this.handleMessageUpdate}
          entry={this.state.message}
          placeholder={`${this.props.language.name} Translation`}
          onFieldFailures={(persistantFailures: ValidationFailure[]) => {
            const text = { ...this.state.message, persistantFailures };
            this.setState({
              message: text,
              valid: this.state.valid && !hasErrors(text)
            });
          }}
          autocomplete={true}
          focus={true}
          textarea={true}
        />

        {audioButton}
      </Dialog>
    );
  }
}
