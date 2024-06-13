import { composeComponentTestUtils } from 'testUtils';

import CheckboxElement, { CheckboxElementProps } from './CheckboxElement';

const baseProps: CheckboxElementProps = {
  name: 'Checkbox',
  checked: false
};

const { setup } = composeComponentTestUtils(CheckboxElement, baseProps);

describe(CheckboxElement.name, () => {
  it('should render a checkbox element with title, description', () => {
    const { wrapper } = setup(false, {
      $merge: {
        title: 'Checkbox',
        description: 'All Destinations',
        labelClassName: 'label',
        checkboxClassName: 'checkbox',
        onChange: jest.fn()
      }
    });
    expect(wrapper).toMatchSnapshot('unchecked');
  });
});
