import * as React from 'react';
import '../../enzymeAdapter.ts';
import { shallow, mount } from 'enzyme';
import TitleBar from './TitleBar';

const titleBarProps = {
    title: 'Wait for Name',
    onRemoval: jest.fn()
};

const TitleBarShallow = shallow(<TitleBar {...titleBarProps} />);

describe('Component: TitleBar', () => {
    it('should render', () => {
        expect(TitleBarShallow).toBePresent();
        expect(TitleBarShallow).toHaveState('confirmingRemoval', false);
    });
});
