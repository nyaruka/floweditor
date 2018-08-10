import OptionalTextInput, {
    OptionalTextInputProps
} from '~/components/form/optionaltext/OptionalTextInput';
import { composeComponentTestUtils } from '~/testUtils';

const { setup } = composeComponentTestUtils<OptionalTextInputProps>(OptionalTextInput, {
    name: 'Optional Text Name',
    value: { value: '' },
    toggleText: 'Click me to show',
    onChange: jest.fn()
});

describe(OptionalTextInput.name, () => {
    it('renders', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('updates', () => {
        const { instance } = setup(true);
        instance.handleEditingChanged();
        instance.handleTextChanged('Updated Text');
        expect(instance.state).toMatchSnapshot();
    });
});
