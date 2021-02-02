import { react as bindCallbacks } from 'auto-bind';
import FormElement, { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';
import { StringEntry } from 'store/nodeEditor';
import { createTextInput } from './helpers';

import styles from './TextInputElement.module.scss';
export enum Count {
  SMS = 'SMS'
}

export enum TextInputStyle {
  small = 'small',
  medium = 'medium',
  normal = 'normal'
}

export interface TextInputProps extends FormElementProps {
  entry?: StringEntry;
  __className?: string;
  count?: Count;
  textarea?: boolean;
  placeholder?: string;
  autocomplete?: boolean;
  focus?: boolean;
  showInvalid?: boolean;
  maxLength?: number;
  counter?: string;
  style?: TextInputStyle;
  onChange?: (value: string, name?: string) => void;
  onBlur?: (event: React.ChangeEvent) => void;
}

export default class TextInputElement extends React.Component<TextInputProps> {
  constructor(props: TextInputProps) {
    super(props);

    let initial = '';
    if (this.props.entry && this.props.entry.value) {
      initial = this.props.entry.value;
    }

    this.state = {
      value: initial
    };

    bindCallbacks(this, {
      include: [/^on/, /Ref$/, 'setSelection', 'validate', /^has/, /^handle/]
    });
  }

  public componentDidMount(): void {
    // return this.props.focus && this.focusInput();
  }

  public handleChange({ currentTarget: { value } }: any): void {
    if (this.props.onChange) {
      this.props.onChange(value, this.props.name);
    }
  }

  public render(): JSX.Element {
    const charCount: JSX.Element =
      this.props.count && this.props.count === Count.SMS ? (
        <temba-charcount text={this.props.entry.value}></temba-charcount>
      ) : null;

    const optional: any = {};
    if (this.props.textarea) {
      optional['textarea'] = true;
    }

    if (this.props.counter) {
      optional['counter'] = this.props.counter;
    }

    return (
      <FormElement
        __className={this.props.__className}
        name={this.props.name}
        helpText={this.props.helpText}
        showLabel={this.props.showLabel}
        // errors={this.state.errors}
        entry={this.props.entry}
      >
        <div className={styles.wrapper + ' ' + styles[this.props.style || TextInputStyle.normal]}>
          {createTextInput(this.props, this.handleChange, optional)}
          {charCount}
        </div>
      </FormElement>
    );
  }
}
