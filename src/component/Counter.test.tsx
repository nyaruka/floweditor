import * as React from 'react';
import { mount } from 'enzyme';
import Counter, { CounterProps } from './Counter';
import { validUUID, addCommas } from '../utils';
import { getSpecWrapper } from '../testUtils';

let props: CounterProps;
let handleClick;
let counter;
let counterOutter;
let counterInner;

// This is only necessary because Jasmine requires spies to be initialied in a 'before' function
beforeAll(() => {
    props = {
        containerStyle: 'style goes here',
        countStyle: 'count style goes here',
        getCount: jest.fn().mockReturnValue(10000),
        onUnmount: jest.fn()
    };

    // Spies on object properties that contain functions need to be intialized before the component is rendered
    handleClick = spyOn(Counter.prototype, 'handleClick');

    counter = mount(<Counter {...props} />);
    counterOutter = getSpecWrapper(counter, 'counter-outter');
    counterInner = getSpecWrapper(counter, 'counter-inner');
});

describe('Counter >', () => {
    describe('render >', () => {
        it('should render', () => {
            expect(counter.exists()).toBeTruthy();
            expect(counterOutter.exists()).toBeTruthy();
            expect(counterInner.exists()).toBeTruthy();
        });

        it('should initialize with expected state', () => {
            expect(counter.state('count')).toEqual(props.getCount());
        });

        it('should handle clicks', () => {
            counterOutter.simulate('click');
            expect(handleClick).toBeCalled();
        });

        it('should display a count', () => {
            expect(counterInner.text()).toBe(addCommas(props.getCount()));
        });
    });
});
