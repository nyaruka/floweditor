import { composeComponentTestUtils, mock } from 'testUtils';
import * as utils from 'utils';

import MultiChoiceInput, { MultiChoiceInputProps } from './MultiChoice';

const { setup } = composeComponentTestUtils<MultiChoiceInputProps>(MultiChoiceInput, {
  name: 'Multi Choice',
  items: { value: ['one', 'two', 'three'] }
});

mock(utils, 'createUUID', utils.seededUUIDs());

describe(MultiChoiceInput.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });
});
