import setCaretPosition from 'get-input-selection';
import * as React from 'react';

import { Types } from '../../../config/typeConfigs';
import { composeComponentTestUtils, setMock } from '../../../testUtils';
import { KeyValues, OPTIONS } from './constants';
import { TextInputElement, TextInputProps } from './TextInputElement';

const resultNames = [{ name: 'run.results.color', description: 'Result for "color"' }];

const baseProps: TextInputProps = {
    name: 'Message',
    type: Types.send_msg,
    resultNames
};

const { setup, spyOn } = composeComponentTestUtils(TextInputElement, baseProps);

jest.mock('get-input-selection', () => ({
    default: jest.fn()
}));

describe(TextInputElement.name, () => {
    afterEach(() => {
        setCaretPosition.mockReset();
    });

    const contactOptionName = OPTIONS[0].name;
    const contactTopLevelOption = `@${contactOptionName}`;
    const contactAttribQuery = contactTopLevelOption.slice(0, 2);

    it('should call change handler prop when user hits tab with completion option selected', () => {
        const setStateSpy = spyOn('setState');
        const onKeyDownSpy = spyOn('onKeyDown');
        const { wrapper, props } = setup(false, {
            onChange: setMock(),
            textarea: { $set: true },
            autocomplete: { $set: true }
        });
        const input = wrapper.find('textarea');

        // Bring up completion menu
        input.simulate('keydown', {
            key: KeyValues.KEY_AT
        });

        // Trigger filter for contact options
        // Issue related to approach: https://github.com/airbnb/enzyme/issues/364
        input.props().onChange({
            currentTarget: {
                value: contactAttribQuery,
                selectionStart: contactAttribQuery.length
            }
        });

        // Complete expression
        input.simulate('keydown', {
            key: KeyValues.KEY_TAB
        });

        expect(setStateSpy).toHaveBeenCalledTimes(3);
        expect(props.onChange).toHaveBeenCalledTimes(2);
        expect(props.onChange).toHaveBeenCalledWith(contactAttribQuery);
        expect(props.onChange).toHaveBeenCalledWith(contactTopLevelOption);
        expect(setCaretPosition).toHaveBeenCalledTimes(1);
        expect(setCaretPosition).toHaveBeenCalledWith(
            wrapper.instance().textEl,
            contactTopLevelOption.length
        );

        setStateSpy.mockRestore();
        onKeyDownSpy.mockRestore();
    });

    it('should call change handler prop when user hits enter with completion option selected', () => {
        const setStateSpy = spyOn('setState');
        const onKeyDownSpy = spyOn('onKeyDown');
        const { wrapper, props } = setup(false, {
            onChange: setMock(),
            textarea: { $set: true },
            autocomplete: { $set: true }
        });
        const input = wrapper.find('textarea');

        // Bring up completion menu
        input.simulate('keydown', {
            key: KeyValues.KEY_AT
        });

        // Trigger filter for contact options
        // Issue related to approach: https://github.com/airbnb/enzyme/issues/364
        input.props().onChange({
            currentTarget: { value: contactAttribQuery, selectionStart: contactAttribQuery.length }
        });

        // Complete expression
        input.simulate('keydown', {
            key: KeyValues.KEY_ENTER
        });

        expect(setStateSpy).toHaveBeenCalledTimes(3);
        expect(props.onChange).toHaveBeenCalledTimes(2);
        expect(props.onChange).toHaveBeenCalledWith(contactAttribQuery);
        expect(props.onChange).toHaveBeenCalledWith(contactTopLevelOption);
        expect(setCaretPosition).toHaveBeenCalledTimes(1);
        expect(setCaretPosition).toHaveBeenCalledWith(
            wrapper.instance().textEl,
            contactTopLevelOption.length
        );

        setStateSpy.mockRestore();
        onKeyDownSpy.mockRestore();
    });
});
