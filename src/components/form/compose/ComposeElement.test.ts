import ComposeElement, { ComposeProps } from 'components/form/compose/ComposeElement';
import { composeComponentTestUtils } from 'testUtils';

const baseProps: ComposeProps = {
  name: 'Compose',
  entry: { value: '' }
};

const { setup } = composeComponentTestUtils(ComposeElement, baseProps);

const createWrapper = () => {
  return setup(false, {
    $merge: {
      chatbox: true,
      attachments: true,
      counter: true,
      button: true,
      // handleButtonClicked: jest.fn(),
      onChange: jest.fn()
    }
  }).wrapper;
};

describe(ComposeElement.name, () => {
  it('renders', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });
});
