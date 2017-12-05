import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import Button, { ButtonProps } from './Button';
import { getSpecWrapper } from '../helpers/utils';

const props: ButtonProps = {
    name: 'Save',
    onClick: jest.fn(),
    type: 'primary'
};

const ButtonReact = mount(<Button {...props} />);

const buttonDivReact = getSpecWrapper(
    ButtonReact,
    `button-${props.type}-${props.name.toLowerCase()}`
) as ReactWrapper;

describe('Component: Button', () => {
    it('Renders', () => {
        expect(ButtonReact.exists()).toBeTruthy();
        expect(buttonDivReact.exists()).toBeTruthy();
    });

    it('Renders with the right CSS classes', () => {
        expect(buttonDivReact.hasClass('primary')).toBeTruthy();
    });

    it('Renders with the right name', () => {
        expect(buttonDivReact.text()).toBe('Save');
    });

    it('Executes onClick callback when clicked', () => {
        buttonDivReact.simulate('click');
        expect(props.onClick).toHaveBeenCalled();
    });
});
