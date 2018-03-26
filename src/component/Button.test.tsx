import * as React from 'react';
import { mount } from 'enzyme';
import Button, { ButtonProps } from './Button';
import { getSpecWrapper } from '../testUtils';

const props: ButtonProps = {
    name: 'Save',
    onClick: jest.fn(),
    type: 'primary'
};

describe('Button >', () => {
    const wrapper = mount(<Button {...props} />);
    const buttonDiv = getSpecWrapper(wrapper, `button-${props.type}-${props.name.toLowerCase()}`);

    describe('render >', () => {
        it('should render', () => {
            expect(wrapper.exists()).toBeTruthy();
            expect(buttonDiv.exists()).toBeTruthy();
        });

        it('should render with the right CSS classes', () => {
            expect(buttonDiv.hasClass('primary')).toBeTruthy();
        });

        it('should render with the right name', () => {
            expect(buttonDiv.text()).toBe('Save');
        });

        it('should execute onClick callback when clicked', () => {
            buttonDiv.simulate('click');
            expect(props.onClick).toHaveBeenCalled();
        });
    });
});
