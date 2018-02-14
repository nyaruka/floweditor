import * as React from 'react';
import { mount } from 'enzyme';
import Button, { ButtonProps } from './Button';
import { getSpecWrapper } from '../utils';

const props: ButtonProps = {
    name: 'Save',
    onClick: jest.fn(),
    type: 'primary'
};

describe('Button >', () => {
    describe('render >', () => {
        const ButtonReact = mount(<Button {...props} />);

        const buttonDivReact = getSpecWrapper(
            ButtonReact,
            `button-${props.type}-${props.name.toLowerCase()}`
        );

        it('should render with the right CSS classes', () => {
            expect(buttonDivReact.hasClass('primary')).toBeTruthy();
        });

        it('should render with the right name', () => {
            expect(buttonDivReact.text()).toBe('Save');
        });

        it('should execute onClick callback when clicked', () => {
            buttonDivReact.simulate('click');
            expect(props.onClick).toHaveBeenCalled();
        });
    });
});
