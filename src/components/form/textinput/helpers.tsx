import * as React from 'react';
import { TextInputProps } from './TextInputElement';

export const createTextInput = (props: TextInputProps, handleChange: any, optional: any) => {
  return props.autocomplete ? (
    <temba-completion
      name={props.name}
      onInput={handleChange}
      onBlur={props.onBlur}
      value={props.entry.value}
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
      value={props.entry.value}
      placeholder={props.placeholder}
      maxLength={props.maxLength || -1}
      {...optional}
    ></temba-textinput>
  );
};
