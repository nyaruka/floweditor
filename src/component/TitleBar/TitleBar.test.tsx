import * as React from 'react';
import { mount } from 'enzyme';
import TitleBar from './TitleBar';

const titleBarProps = {
    title: 'Wait for Name',
    onRemoval: jest.fn()
};

describe('TitleBar >', () => {
    it('should render', () => {
        const wrapper = mount(<TitleBar {...titleBarProps} />);
        expect(wrapper.exists()).toBeTruthy();
        expect(wrapper.state('confirmRemoval')).toBeFalsy();
    });
});
