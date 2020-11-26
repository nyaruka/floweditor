import TextInputElement, { TextInputProps } from 'components/form/textinput/TextInputElement';
import { composeComponentTestUtils } from 'testUtils';

const baseProps: TextInputProps = {
  name: 'Message',
  entry: { value: '' }
};

const { setup } = composeComponentTestUtils(TextInputElement, baseProps);

const createWrapper = () => {
  return setup(false, {
    $merge: {
      onChange: jest.fn(),
      textarea: true,
      autocomplete: true,
      onBlur: jest.fn()
    }
  }).wrapper;
};

describe(TextInputElement.name, () => {
  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });
});
