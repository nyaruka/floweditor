import * as React from 'react';
import '../../enzyme.adapter';
import { mount, ReactWrapper } from 'enzyme';
import { ButtonProps, Button } from './Button';
import { getSpecWrapper } from '../__tests__/utils';

const props: ButtonProps = {
    name: 'Save',
    onClick: jest.fn(),
    type: 'primary'
};
const ButtonReact: ReactWrapper = mount(<Button {...props} />);
const buttonDivReact: ReactWrapper = getSpecWrapper(
    ButtonReact,
    `button-${props.type}-${props.name.toLowerCase()}`
) as ReactWrapper;

describe('Button Component', () => {
    it('Renders', () => {
        expect(ButtonReact).toBePresent(); 
        expect(buttonDivReact).toBePresent();
    });

    it('Renders with the right CSS classes', () => {
        expect(buttonDivReact.hasClass('primary')).toBeTruthy();
    });

    it('Renders with the right name', () => {
        expect(buttonDivReact).toHaveText('Save');
    });

    it('Executes onClick callback when clicked', () => {
        buttonDivReact.simulate('click');
        expect(props.onClick).toHaveBeenCalled();
    });
});
