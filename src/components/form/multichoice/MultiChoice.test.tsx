import { composeComponentTestUtils, mock } from '~/testUtils';
import * as utils from '~/utils';

import MultiChoiceInput, { MultiChoiceInputProps } from './MultiChoice';

const { setup } = composeComponentTestUtils<MultiChoiceInputProps>(MultiChoiceInput, {
    name: 'Multi Choice',
    items: { value: ['one', 'two', 'three'] },
    onRemoved: jest.fn(),
    onItemAdded: jest.fn(),
    onFieldErrors: jest.fn()
});

mock(utils, 'createUUID', utils.seededUUIDs());
jest.useFakeTimers();

const addItem = (instance: MultiChoiceInput, item: string) => {
    instance.handleInputChanged('a new item');
    instance.handleAddItem();

    // multichoice does a timeout zero on add for validation checks
    jest.runAllTimers();
};

describe(MultiChoiceInput.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('should update', () => {
        const { instance, props } = setup(true);

        addItem(instance, 'My Item');

        expect(props.onItemAdded).toHaveBeenCalled();
        expect(instance.state).toMatchSnapshot();
        expect(instance.props.onItemAdded).toMatchCallSnapshot();
    });
});
