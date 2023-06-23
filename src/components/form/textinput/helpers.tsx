import * as React from 'react';
import { TextInputProps } from './TextInputElement';

export const createTextInput = (props: TextInputProps, handleChange: any, optional: any) => {
  let value = '';
  if (props.entry && props.entry.value) {
    value = props.entry.value;
  }

  return props.autocomplete ? (
    <temba-completion
      name={props.name}
      onInput={handleChange}
      onBlur={props.onBlur}
      value={value}
      placeholder={props.placeholder || ''}
      maxLength={props.maxLength || -1}
      session
      {...optional}
    ></temba-completion>
  ) : (
    <temba-textinput
      name={props.name}
      onInput={handleChange}
      onBlur={props.onBlur}
      value={value}
      placeholder={props.placeholder}
      maxLength={props.maxLength || -1}
      {...optional}
    ></temba-textinput>
  );
};
