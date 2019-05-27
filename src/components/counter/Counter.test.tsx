import { mount } from 'enzyme';
import * as React from 'react';
import Counter, { CounterProps } from 'components/counter/Counter';
import { getSpecWrapper } from 'testUtils';
import { addCommas } from 'utils';

let props: CounterProps;
let counter: any;
let counterOutter: any;
let counterInner: any;

// This is only necessary because Jasmine requires spies to be initialied in a 'before' function
beforeAll(() => {
  props = {
    keepVisible: false,
    containerStyle: 'style goes here',
    countStyle: 'count style goes here',
    count: 1000
  };

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

    it('should handle clicks', () => {
      counterOutter.simulate('click');
    });

    it('should display a count', () => {
      expect(counterInner.text()).toBe(addCommas(1000));
    });
  });
});
