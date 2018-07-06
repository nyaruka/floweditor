import setCaretPosition from 'get-input-selection';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { ContactFields, ResultMap } from '~/store/flowContext';
import { composeComponentTestUtils } from '~/testUtils';

import { KeyValues, OPTIONS } from './constants';
import { TextInputElement, TextInputProps } from './TextInputElement';

const baseProps: TextInputProps = {
    name: 'Message',
    typeConfig: getTypeConfig(Types.send_msg),
    resultMap: {} as ResultMap,
    contactFields: {} as ContactFields
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
    const mockEvent = {
        preventDefault(): void {
            return;
        },
        stopPropagation(): void {
            return;
        }
    };

    it('should handle completion option selection w/ "Tab" key', () => {
        const setStateSpy = spyOn('setState');
        const { wrapper, props } = setup(false, {
            $merge: {
                onChange: jest.fn(),
                textarea: true,
                autocomplete: true
            }
        });
        const input = wrapper.find('textarea');

        // Bring up completion menu
        input.prop('onKeyDown')({
            ...mockEvent,
            key: KeyValues.KEY_AT
        });

        // Trigger filter for contact options
        // Issue related to approach: https://github.com/airbnb/enzyme/issues/364
        input.prop('onChange')({
            currentTarget: {
                value: contactAttribQuery,
                selectionStart: contactAttribQuery.length
            }
        });

        // Complete expression
        input.prop('onKeyDown')({
            ...mockEvent,
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
    });

    it('should handle completion option selection w/ "Enter" key', () => {
        const setStateSpy = spyOn('setState');
        const { wrapper, props } = setup(false, {
            $merge: {
                onChange: jest.fn(),
                textarea: true,
                autocomplete: true
            }
        });
        const input = wrapper.find('textarea');

        // Bring up completion menu
        input.prop('onKeyDown')({
            ...mockEvent,
            key: KeyValues.KEY_AT
        });

        // Trigger filter for contact options
        input.prop('onChange')({
            currentTarget: { value: contactAttribQuery, selectionStart: contactAttribQuery.length }
        });

        // Complete expression
        input.prop('onKeyDown')({
            ...mockEvent,
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
    });

    it('should handle completion navigation w/ OSX shortcuts, arrow keys', () => {
        const setSelectionSpy = spyOn('setSelection');
        const { wrapper, props } = setup(false, {
            $merge: {
                onChange: jest.fn(),
                textarea: true,
                autocomplete: true
            }
        });
        const input = wrapper.find('textarea');

        // Bring up completion menu
        input.prop('onKeyDown')({
            ...mockEvent,
            key: KeyValues.KEY_AT
        });

        input.prop('onChange')({
            currentTarget: { value: KeyValues.KEY_AT, selectionStart: 1 }
        });

        // Move down w/ 'ArrowDown' key
        input.prop('onKeyDown')({
            ...mockEvent,
            key: KeyValues.KEY_DOWN
        });

        // Move down w/ 'ctrl + n' macos shortcut
        input.prop('onKeyDown')({
            ...mockEvent,
            ctrlKey: true,
            key: KeyValues.KEY_N
        });

        expect(setSelectionSpy).toHaveBeenCalledTimes(2);
        expect(setSelectionSpy).toHaveBeenCalledWith(1);
        expect(setSelectionSpy).toHaveBeenCalledWith(2);

        // Move down w/ 'ArrowUp' key
        input.prop('onKeyDown')({
            ...mockEvent,
            key: KeyValues.KEY_UP
        });

        // Move down w/ 'ctrl + p' macos shortcut
        input.prop('onKeyDown')({
            ...mockEvent,
            ctrlKey: true,
            key: KeyValues.KEY_P
        });

        expect(setSelectionSpy).toHaveBeenCalledTimes(4);
        expect(setSelectionSpy).toHaveBeenCalledWith(1);
        expect(setSelectionSpy).toHaveBeenCalledWith(0);

        setSelectionSpy.mockRestore();
    });
});
