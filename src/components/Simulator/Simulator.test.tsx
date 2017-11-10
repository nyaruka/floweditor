import * as React from 'react';
import '../../enzymeAdapter';
import { shallow } from 'enzyme';
import ActivityManager from '../../services/ActivityManager';
import SimulatorComp, { SimulatorProps } from './Simulator';

const {
    results: [{ definition, uuid: flowUUID }]
} = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const Activity = new ActivityManager(flowUUID, jest.fn());

const simulatorProps: SimulatorProps = {
    definition,
    engineURL: 'https://your-engine.com',
    getFlow: jest.fn(),
    showDefinition: jest.fn(),
    plumberRepaint: jest.fn(),
    Activity
};

const SimulatorShallow = shallow(<SimulatorComp {...simulatorProps} />);

describe('Component: Simulator', () => {
    it('should render', () => {
        expect(SimulatorShallow.exists()).toBeTruthy();
        expect(SimulatorShallow.state('active')).toBeFalsy();
        expect(SimulatorShallow.state('visible')).toBeFalsy();
        expect(SimulatorShallow.state('events')).toEqual([]);
        expect(SimulatorShallow.state()).toBeTruthy();
        expect(SimulatorShallow.state()).toBeTruthy();
    });
});
