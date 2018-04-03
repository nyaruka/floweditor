import { createSetup } from '../testUtils';
import Button, { ButtonProps, ButtonTypes } from './Button';

const baseProps: ButtonProps = {
    name: 'Save',
    onClick: jest.fn(),
    type: ButtonTypes.primary
};

const setup = createSetup<ButtonProps>(Button, baseProps);

const COMPONENT_TO_TEST = Button.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup({}, true);

            expect(wrapper.hasClass('btn')).toBeTruthy();
            expect(wrapper.hasClass('primary')).toBeTruthy();
            expect(wrapper.text()).toBe('Save');
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('interaction', () => {
        it('should execute onClick callback when clicked', () => {
            const { wrapper, props: { onClick: onClickMock } } = setup(
                { onClick: jest.fn() },
                true
            );

            wrapper.simulate('click');

            expect(onClickMock).toHaveBeenCalled();
        });
    });
});
