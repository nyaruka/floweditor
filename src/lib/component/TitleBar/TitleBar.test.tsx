import * as React from 'react';
import { shallow, mount } from 'enzyme';
import TitleBar from './TitleBar';

const titleBarProps = {
    title: 'Wait for Name',
    onRemoval: jest.fn()
};

describe('TitleBar >', () => {
    describe('render >', () => {
        const wrapper = shallow(<TitleBar {...titleBarProps} />);
        it('should render', () => {
            expect(wrapper.exists()).toBeTruthy();
            expect(wrapper.state('confirmRemoval')).toBeFalsy();
        });
    });
});
