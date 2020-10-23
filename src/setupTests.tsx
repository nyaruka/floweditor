import '@testing-library/react/cleanup-after-each';
import '@testing-library/jest-dom/extend-expect';

import { Console } from 'console';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { mock } from 'testUtils';
import * as utils from 'utils';
import * as TextInput from 'components/form/textinput/helpers';
import { TextInputProps } from 'components/form/textinput/TextInputElement';

mock(utils, 'createUUID', utils.seededUUIDs());

// Declare custom matcher types
declare global {
  namespace jest {
    interface Matchers<R> {
      toPointTo(renderNode: any): R;
      toHaveExitThatPointsTo(renderNode: any): R;
      toHaveInboundFrom(exit: any): R;
      toHaveExitWithDestination(): R;
      toHaveInboundConnections(): R;
      toHavePayload(action: string, payload: any): R;
      toHaveReduxActions(actions: string[]): R;
      toMatchCallSnapshot(snapshotName?: string): R;
      toBeUnique(): R;
    }
  }
}

// Ensure console logs are visible while running tests https://github.com/facebook/jest/issues/3853
global.console = new Console(process.stderr, process.stderr);

// Configure Enzyme adapter
const config = { adapter: new Adapter() };
configure(config);

// RAF shim
// tslint:disable-next-line:ban-types
(global as any).requestAnimationFrame = (callback: Function) => {
  setTimeout(callback, 0);
};

// no support for lit-elements in RTL, mock in vanilla inputs
mock(TextInput, 'createTextInput', (props: TextInputProps, handleChange, optional) => {
  return (
    <input
      data-testid={props.name}
      name={props.name}
      placeholder={props.placeholder}
      value={props.entry.value}
      onChange={handleChange}
    ></input>
  );
});

// we mock react-select to look like a normal select widget, this makes
// testing much easier since we can use the standard event model
jest.mock(
  'react-select',
  () => ({
    options,
    value,
    onChange,
    getOptionLabel,
    getOptionValue,
    isMulti,
    isValidNewOption
  }: {
    options: any;
    value: any;
    onChange: any;
    getOptionLabel: any;
    getOptionValue: any;
    isMulti: any;
    isValidNewOption: any;
  }) => {
    function handleChange(event: { currentTarget: { value: any } }) {
      const option: any = options.find((option: any) => {
        const value = option.value || getOptionValue(option);
        return value === event.currentTarget.value;
      });

      if (isMulti) {
        onChange([option]);
      } else {
        onChange(option);
      }
    }

    return (
      <select
        data-testid="select"
        value={getOptionValue ? getOptionValue(value) : value}
        onChange={handleChange}
        multiple={isMulti}
      >
        {options.map((option: any) => {
          let optionLabel = option.label || getOptionLabel(option);
          let optionValue = option.value || getOptionValue(option);
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    );
  }
);

// In Node v7 unhandled promise rejections will terminate the process
process.on('unhandledRejection', reason => {
  throw reason;
});
