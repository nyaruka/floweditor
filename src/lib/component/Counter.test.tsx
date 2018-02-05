import * as React from 'react';
import { mount } from 'enzyme';
import Counter, { CounterProps } from './Counter';
import { getSpecWrapper, validUUID, addCommas } from '../utils';

let props: CounterProps;
let handleClick;
let CounterReact;
let counterOutterReact;
let counterInnerReact;

// This is only necessary because Jasmine requires spies to be initialied in a 'before'-type function
beforeAll(() => {
    props = {
        containerStyle: 'style goes here',
        countStyle: 'count style goes here',
        getCount: jest.fn().mockReturnValue(10000),
        onUnmount: jest.fn()
    };

    // Spies on object properties that contain functions need to be intialized before the component is rendered
    handleClick = jest.spyOn(Counter.prototype, 'handleClick');

    CounterReact = mount(<Counter {...props} />);
    counterOutterReact = getSpecWrapper(CounterReact, 'counter-outter');
    counterInnerReact = getSpecWrapper(CounterReact, 'counter-inner');
});

describe('Button Component', () => {
    it('Renders', () => {
        expect(CounterReact.exists()).toBeTruthy();
        expect(counterOutterReact.exists()).toBeTruthy();
        expect(counterInnerReact.exists()).toBeTruthy();
    });

    it('Initializes with expected state', () => {
        expect(CounterReact.state('count')).toEqual(props.getCount());
    });

    it('Handles clicks', () => {
        counterOutterReact.simulate('click');
        expect(handleClick).toBeCalled();

        handleClick.mockRestore();
    });

    it('Displays a count', () => {
        expect(counterInnerReact.text()).toBe(addCommas(props.getCount()));
    });
});
