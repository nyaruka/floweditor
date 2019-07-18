import { KeyValues } from 'components/form/textinput/constants';
import {
  TextInputElement,
  TextInputProps,
  TextInputState
} from 'components/form/textinput/TextInputElement';
import { Types } from 'config/interfaces';
import { getTypeConfig } from 'config/typeConfigs';
import setCaretPosition from 'get-input-selection';
import { AssetType } from 'store/flowContext';
import * as completionSchema from 'test/assets/completion.json';
import functions from 'test/assets/functions.json';
import { composeComponentTestUtils } from 'testUtils';

// we need to track where our cursor would be to simulate properly
let mockCursor = 0;

const baseProps: TextInputProps = {
  name: 'Message',
  typeConfig: getTypeConfig(Types.send_msg),
  assetStore: { fields: { items: {}, type: AssetType.Field } },
  completionSchema,
  functions
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

  const value: string = wrap.instance().textEl.value;
  let result = value.substr(0, mockCursor);
  const end = value.substr(mockCursor);

  for (const key of keys) {
    input.prop('onKeyDown')({
      ...mockEvent,
      key
    });

    result += key;
    mockCursor++;

    input.prop('onKeyUp')({
      ...mockEvent,
      key
    });

    input.prop('onChange')({
      currentTarget: {
        value: result + end,
        selectionStart: mockCursor
      }
    });
  }
};

const simulateKey = (wrap: any, key: KeyValues, ctrlKey: boolean = false, presses: number = 1) => {
  for (let i = 0; i < presses; i++) {
    if (key === KeyValues.KEY_AT) {
      simulateString(wrap, key);
    } else {
      const input = wrap.find('textarea');
      const startLength = wrap.instance().textEl.value.length;

      // fire a key event
      input.prop('onKeyDown')({
        ...mockEvent,
        key,
        ctrlKey,
        currentTarget: {
          value: wrap.instance().textEl.value,
          selectionStart: mockCursor
        }
      });

      // fire a key event
      input.prop('onKeyUp')({
        ...mockEvent,
        key,
        ctrlKey,
        currentTarget: {
          value: wrap.instance().textEl.value,
          selectionStart: mockCursor
        }
      });

      // update our mock cursor accordingly
      if (key === KeyValues.KEY_LEFT) {
        mockCursor--;
      } else if (key === KeyValues.KEY_RIGHT) {
        mockCursor++;
      } else {
        mockCursor += wrap.instance().textEl.value.length - startLength;
      }
    }
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
      autocomplete: true,
      onFieldFailures: jest.fn(),
      onBlur: jest.fn()
    }
  }).wrapper;
};

describe(TextInputElement.name, () => {
  beforeEach(() => {
    mockCursor = 0;
  });
  afterEach(() => {
    setCaretPosition.default.mockReset();
  });

  describe('function context', () => {
    it('should use the most recent incomplete function', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@(max(default(contact.rank, cont');

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.query).toEqual('cont');
      expect(state.matches.length).toBe(1);
      expect(state.matches).toMatchSnapshot();
      expect(state.fn.signature).toEqual('default(value, default)');
    });

    it('should use fold back on function completion', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@(max(default(contact.rank, contact.age), ');

      const state = getState(wrapper);
      expect(state.query).toEqual('');
      expect(state.fn.signature).toEqual('max(numbers...)');
    });
  });

  describe('filtering', () => {
    it('should bring up completion menu for top level options', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@');

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.query).toEqual('');

      // should show all top level options
      expect(state.matches).toMatchSnapshot();
    });

    it('should show filter options', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@co');

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.query).toEqual('co');

      // only our contact option should be there
      expect(state.matches.length).toBe(1);
      expect(state.matches).toMatchSnapshot();
    });

    it('should show filter at the second level', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@contact.first');

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.query).toEqual('contact.first');

      // should see first name
      expect(state.matches.length).toBe(1);
      expect(state.matches).toMatchSnapshot();
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
      expect(state.matches.length).toBeGreaterThan(10);
      expect(state.completionVisible).toBeTruthy();
    });

    it('should bring up functions within text', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, 'some text @(');

      const state = getState(wrapper);
      expect(state.matches.length).toBeGreaterThan(10);
      expect(state.completionVisible).toBeTruthy();
    });
  });

  describe('completion', () => {
    it('should handle completion w/ "Enter" key', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@cont');
      simulateKey(wrapper, KeyValues.KEY_ENTER);

      const state = getState(wrapper);
      expect(state.completionVisible).toBeFalsy();
      expect(state.query).toEqual('');
      expect(state.matches.length).toBe(0);
    });

    it('should handle completion w/ "Tab" key', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@cont');
      simulateKey(wrapper, KeyValues.KEY_TAB);

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.query).toEqual('contact');

      // tabbing forward should give us all our contact options
      expect(state.matches).toMatchSnapshot();
    });

    it('should complete in the middle of text', () => {
      const wrapper = createWrapper();

      // type some text then move cursor back
      simulateString(wrapper, 'hello world');
      simulateKey(wrapper, KeyValues.KEY_LEFT, false, 6);

      // enter a query and complete it
      simulateString(wrapper, ' @cont');
      simulateKey(wrapper, KeyValues.KEY_TAB);

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.query).toEqual('contact');
      expect(state.value).toBe('hello @contact world');

      // tabbing forward should give us all our contact options
      expect(state.matches).toMatchSnapshot();
    });

    it('should complete over adjacent text', () => {
      const wrapper = createWrapper();

      // type some text then move cursor back
      simulateString(wrapper, 'hello contact');
      simulateKey(wrapper, KeyValues.KEY_LEFT, false, 7);
      simulateKey(wrapper, KeyValues.KEY_AT);
      simulateKey(wrapper, KeyValues.KEY_TAB);

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.value).toBe('hello @contact');
    });

    it('should complete over dot extensions', () => {
      const wrapper = createWrapper();

      // type some text then move cursor back
      simulateString(wrapper, 'hello @contact.first_name');
      simulateKey(wrapper, KeyValues.KEY_LEFT, false, 17);
      simulateString(wrapper, 'h');
      simulateKey(wrapper, KeyValues.KEY_TAB);

      const state = getState(wrapper);
      expect(state.completionVisible).toBeTruthy();
      expect(state.value).toBe('hello @child');
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

      // tabbing forward should give us all our contact options
      expect(state.matches.length).toBe(1);
      expect(state.matches[0].name).toBe('contact.first_name');
      expect(state.matches).toMatchSnapshot();
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
  });

  describe('visibility', () => {
    it('should check contact fields on blur', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@fields.missing');
      wrapper.instance().handleBlur({});
      expect(wrapper.props().onFieldFailures).toHaveBeenCalled();
    });

    it('should hide if outside completed expression', () => {
      const wrapper = createWrapper();
      simulateString(wrapper, '@(default(contact.first_name, contact.name))');

      const state = getState(wrapper);
      expect(state.completionVisible).toBeFalsy();
      expect(state.matches.length).toBe(0);
    });

    it('should hide if navigating out of expression', () => {
      const wrapper = createWrapper();

      // enter some text, backpedal and insert an expression
      simulateString(wrapper, 'hello world');
      simulateKey(wrapper, KeyValues.KEY_LEFT, false, 6);
      simulateString(wrapper, ' @cont');

      // now move right until we are out of the expression
      simulateKey(wrapper, KeyValues.KEY_RIGHT, false, 4);

      const state = getState(wrapper);
      expect(state.completionVisible).toBeFalsy();
      expect(state.matches.length).toBe(0);
    });

    it('should show completion with ctrl+space', () => {
      const wrapper = createWrapper();

      // enter some text, backpedal and insert an expression
      simulateString(wrapper, '@contact.first_name is ready');
      simulateKey(wrapper, KeyValues.KEY_LEFT, false, 10);

      // shouldn't see completion yet
      expect(getState(wrapper).completionVisible).toBeFalsy();

      // now do the Ctrl+Space shortcut to show completion
      simulateKey(wrapper, KeyValues.KEY_SPACE, true);
      expect(getState(wrapper).completionVisible).toBeTruthy();
    });
  });
});
