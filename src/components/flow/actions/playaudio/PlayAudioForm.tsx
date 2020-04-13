import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { validate, Required } from 'store/validators';

import { initializeForm, stateToAction } from './helpers';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';
import { renderIssues } from '../helpers';

export interface PlayAudioFormState extends FormState {
  audio: StringEntry;
}

export default class PlayAudioForm extends React.Component<ActionFormProps, PlayAudioFormState> {
  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public handleAudioUpdate(text: string): boolean {
    const updates: Partial<PlayAudioFormState> = {};
    updates.audio = validate(i18n.t('forms.recording', 'Recording'), text, [Required]);

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    // make sure we validate untouched text fields
    const valid = this.handleAudioUpdate(this.state.audio.value);

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

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>{i18n.t('forms.recording_label', 'Previous Recording')}</p>
        <TextInputElement
          name={i18n.t('forms.message', 'Message')}
          showLabel={false}
          onChange={this.handleAudioUpdate}
          entry={this.state.audio}
          autocomplete={true}
          focus={true}
          helpText={
            <Trans i18nKey="forms.play_audio_help_text">
              Enter a variable that contains a recording the contact has previously recorded. For
              example, @results.voicemail or @fields.short_bio.
            </Trans>
          }
        />
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
