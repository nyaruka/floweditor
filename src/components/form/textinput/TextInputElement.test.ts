import setCaretPosition from 'get-input-selection';
import { KeyValues } from '~/components/form/textinput/constants';
import {
    TextInputElement,
    TextInputProps,
    TextInputState
} from '~/components/form/textinput/TextInputElement';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { composeComponentTestUtils } from '~/testUtils';

// import { wrapper } from '~/components/form/textinput/TextInputElement.scss';
const baseProps: TextInputProps = {
    name: 'Message',
    typeConfig: getTypeConfig(Types.send_msg),
    assetStore: {}
};

const { setup, spyOn } = composeComponentTestUtils(TextInputElement, baseProps);

jest.mock('get-input-selection', () => ({
    default: jest.fn()
}));

const mockEvent = {
    preventDefault(): void {
        return;
    },
    stopPropagation(): void {
        return;
    }
};

const simulateString = (wrap: any, keys: string) => {
    const input = wrap.find('textarea');
    let presses = wrap.instance().textEl.value;
    for (const key of keys) {
        input.prop('onKeyDown')({
            ...mockEvent,
            key
        });

        presses += key;

        input.prop('onChange')({
            currentTarget: {
                value: presses,
                selectionStart: presses.length
            }
        });
    }
};

const simulateKey = (wrap: any, key: KeyValues, ctrlKey: boolean = false) => {
    if (key === KeyValues.KEY_AT) {
        simulateString(wrap, key);
    } else {
        const input = wrap.find('textarea');
        input.prop('onKeyDown')({
            ...mockEvent,
            key,
            ctrlKey
        });
    }
};

const getState = (wrap: any): TextInputState => {
    return wrap.instance().state as TextInputState;
};

const createWrapper = () => {
    return setup(false, {
        $merge: {
            onChange: jest.fn(),
            textarea: true,
            autocomplete: true
        }
    }).wrapper;
};

describe(TextInputElement.name, () => {
    afterEach(() => {
        setCaretPosition.mockReset();
    });

    describe('function context', () => {
        it('should use the most recent incomplete function', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@(max(default(contact.rank, cont');

            const state = getState(wrapper);
            expect(state.completionVisible).toBeTruthy();
            expect(state.query).toEqual('cont');
            expect(state.matches.length).toBe(1);
            expect(state.fn.signature).toEqual('default(value, default)');
        });

        it('should use fold back on function completion', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@(max(default(contact.rank, contact.age), ');

            const state = getState(wrapper);
            expect(state.query).toEqual('');
            expect(state.fn.signature).toEqual('max(values...)');
        });
    });

    describe('filtering', () => {
        it('should bring up completion menu for top level options', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@');

            const state = getState(wrapper);
            expect(state.completionVisible).toBeTruthy();
            expect(state.query).toEqual('');
            expect(state.caretOffset).toEqual(1);

            // should show all top level options
            expect(state.matches.length).toBe(5);
        });

        it('should show filter options', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@co');

            const state = getState(wrapper);
            expect(state.completionVisible).toBeTruthy();
            expect(state.query).toEqual('co');
            expect(state.caretOffset).toEqual(3);

            // only our contact option should be there
            expect(state.matches.length).toBe(1);
        });

        it('should not match functions without open paren', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@max');

            const state = getState(wrapper);
            expect(state.matches.length).toBe(0);
            expect(state.completionVisible).toBeFalsy();
        });

        it('should bring up completion menu for top level options and functions', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@(');

            const state = getState(wrapper);
            // should show all top level options and functions
            expect(state.matches.length).toBeGreaterThan(60);
            expect(state.completionVisible).toBeTruthy();
        });

        it('should bring up functions within text', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, 'some text @(');

            const state = getState(wrapper);
            // should show all top level options and functions
            expect(state.matches.length).toBeGreaterThan(60);
            expect(state.completionVisible).toBeTruthy();
        });
    });

    describe('navigation', () => {
        it('should filter after tabbing', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@cont');
            simulateKey(wrapper, KeyValues.KEY_TAB);
            simulateString(wrapper, '.fir');

            const state = getState(wrapper);
            expect(state.completionVisible).toBeTruthy();
            expect(state.query).toEqual('contact.fir');
            expect(state.caretOffset).toEqual(12);

            // tabbing forward should give us all our contact options
            expect(state.matches.length).toBe(1);
            expect(state.matches[0].name).toBe('contact.first_name');
        });

        it('should handle completion w/ "Enter" key', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@cont');
            simulateKey(wrapper, KeyValues.KEY_ENTER);

            const state = getState(wrapper);
            expect(state.completionVisible).toBeFalsy();
            expect(state.query).toEqual('');
            expect(state.caretOffset).toEqual(8);
            expect(state.matches.length).toBe(0);
        });

        it('should allow navigation with arrow keys', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@c');

            simulateKey(wrapper, KeyValues.KEY_DOWN);
            let state = getState(wrapper);
            expect(state.selectedOptionIndex).toBe(1);

            simulateKey(wrapper, KeyValues.KEY_UP);
            state = getState(wrapper);
            expect(state.selectedOptionIndex).toBe(0);
        });

        it('should allow navigation with OSX shortcuts', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@c');

            simulateKey(wrapper, KeyValues.KEY_N, true);
            let state = getState(wrapper);
            expect(state.selectedOptionIndex).toBe(1);

            simulateKey(wrapper, KeyValues.KEY_P, true);
            state = getState(wrapper);
            expect(state.selectedOptionIndex).toBe(0);
        });

        it('should handle completion w/ "Tab" key', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@cont');
            simulateKey(wrapper, KeyValues.KEY_TAB);

            const state = getState(wrapper);
            expect(state.completionVisible).toBeTruthy();
            expect(state.query).toEqual('contact');
            expect(state.caretOffset).toEqual(8);

            // tabbing forward should give us all our contact options
            expect(state.matches.length).toBe(8);
        });
    });

    describe('visibility', () => {
        it('should hide if outside completed expression', () => {
            const wrapper = createWrapper();
            simulateString(wrapper, '@(max(contact.first, contact.second)) ');

            const state = getState(wrapper);
            expect(state.completionVisible).toBeFalsy();
            expect(state.matches.length).toBe(0);
        });
    });
});
