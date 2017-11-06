import * as React from 'react';
import '../enzymeAdapter';
import { ReactWrapper, mount } from 'enzyme';
import { ICounterProps, CounterComp } from './Counter';
import { getSpecWrapper, validUUID, addCommas} from '../helpers/utils';

let props: ICounterProps;
let handleClick: Spy;
let CounterReact: ReactWrapper;
let counterOutterReact: ReactWrapper;
let counterInnerReact: ReactWrapper;

/** This is only necessary because Jasmine requires spies to be initialied in a 'before' function */
beforeAll(() => {
    props = {
        containerStyle: 'style goes here',
        countStyle: 'count style goes here',
        getCount: jest.fn().mockReturnValue(10000),
        onUnmount: jest.fn()
    };

    /** Spies on object properties that contain functions need to be intialized before the component is rendered */
    handleClick = spyOn(CounterComp.prototype, 'handleClick');

    CounterReact = mount(<CounterComp {...props} />);
    counterOutterReact = getSpecWrapper(CounterReact, 'counter-outter') as ReactWrapper;
    counterInnerReact = getSpecWrapper(CounterReact, `counter-inner`) as ReactWrapper;
});

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
        expect(counterInnerReact).toHaveText(addCommas(props.getCount()));
    });
});
