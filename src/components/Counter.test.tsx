import * as React from 'react';
import '../../enzyme.adapter';
import { ReactWrapper, mount } from 'enzyme';
import { CounterProps, CounterComp } from './Counter';
import { getSpecWrapper } from '../../__tests__/utils';
import { addCommas } from '../utils'; 

/** TODO: Test CSS properly */

let props: CounterProps;
let handleClick: SpyInstance;
let CounterReact: ReactWrapper;
let counterOutterReact: ReactWrapper;
let counterInnerReact: ReactWrapper; 

/** This is only necessary because Jasmine requires spies to be initialied in a 'before' function */
beforeAll(() => {
    props = {
        containerSyle: 'style goes here',
        countStyle: 'count style goes here',
        getCount: jest
            .fn()
            .mockReturnValue(10000),
        onUnmount: jest.fn()
    };
    /** Spies on object properties that contain functions need to be intialized before the component is rendered */
    handleClick = spyOn(CounterComp.prototype, 'handleClick');
    CounterReact = mount(<CounterComp {...props} />);
    counterOutterReact = getSpecWrapper(
        CounterReact,
        'counter-outter'
    ); 
    counterInnerReact = getSpecWrapper(
        CounterReact,
        `counter-inner`
    );
})

describe('Button Component', () => {
    it('Renders', () => {
        expect(CounterReact).toBePresent();
        expect(counterOutterReact).toBePresent(); 
        expect(counterInnerReact).toBePresent(); 
    });

    it('Initializes with expected state', () => {
        expect(CounterReact).toHaveState('count', props.getCount()); 
    }); 

    it('Handles clicks', () => {
        counterOutterReact.simulate('click'); 
        expect(handleClick).toBeCalled(); 
    }); 

    it('Displays a count', () => {
        expect(counterInnerReact.text()).toBe(addCommas(props.getCount())); 
    }); 

    it('Calls \'onUnmount\' prop before unmounting', () => { 
        CounterReact.unmount();
        expect(props.onUnmount).toBeCalled();
    });
});
