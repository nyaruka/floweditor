import { react as bindCallbacks } from 'auto-bind';
import TextInputElement from 'components/form/textinput/TextInputElement';
import * as React from 'react';
import { FormState, StringEntry } from 'store/nodeEditor';

import styles from './OptionalTextInput.module.scss';

export interface OptionalTextInputProps {
  name: string;
  value: StringEntry;
  toggleText: string;
  onChange(value: string): void;
  helpText?: string | JSX.Element;
  maxLength?: number;
}

export interface OptionalTextInputState extends FormState {
  editing: boolean;
}

/**
 * OptionalText is a hideable text box
 */
export default class OptionalTextInput extends React.Component<
  OptionalTextInputProps,
  OptionalTextInputState
> {
  constructor(props: OptionalTextInputProps) {
    super(props);
    bindCallbacks(this, {
      include: [/^handle/]
    });

    this.state = {
      editing: this.props.value.value.trim().length > 0,
      valid: true
    };
  }

  private handleTextChanged(text: string): void {
    this.props.onChange(text);
  }

  private handleEditingChanged(): void {
    this.setState({ editing: true });
  }

  public render(): JSX.Element {
    let ele: JSX.Element;

    if (this.state.editing) {
      ele = (
        <TextInputElement
          data-spec="optional-field"
          name={this.props.name}
          showLabel={true}
          entry={this.props.value}
          onChange={this.handleTextChanged}
          helpText={this.props.helpText}
          maxLength={this.props.maxLength}
        />
      );
    } else {
      ele = (
        <span
          data-spec="toggle-link"
          className={styles.toggle_link}
          onClick={this.handleEditingChanged}
        >
          {this.props.toggleText}
        </span>
      );
    }

    return <div className={styles.optional_text_input}>{ele}</div>;
  }
}
