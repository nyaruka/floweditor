import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { ActionFormProps } from 'components/flow/props';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { FormState, mergeForm, StringEntry, ValidationFailure } from 'store/nodeEditor';
import { validate, Required } from 'store/validators';

import { initializeForm, stateToAction } from './helpers';

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
    updates.audio = validate('Recording', text, [Required]);

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
      primary: { name: 'Ok', onClick: this.handleSave },
      secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
    };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>Previous Recording</p>
        <TextInputElement
          name="Message"
          showLabel={false}
          onChange={this.handleAudioUpdate}
          entry={this.state.audio}
          onFieldFailures={(persistantFailures: ValidationFailure[]) => {
            const audio = { ...this.state.audio, persistantFailures };
            this.setState({
              audio,
              valid: this.state.valid && !hasErrors(audio)
            });
          }}
          autocomplete={true}
          focus={true}
          helpText={
            'Enter a variable that contains a recording the contact has previously recorded. For example, @results.voicemail or @fields.short_bio.'
          }
        />
      </Dialog>
    );
  }
}
