import * as React from 'react';
import '../../enzymeAdapter';
import { shallow } from 'enzyme';
import ActivityManager from '../../services/ActivityManager';
import Simulator, { ISimulatorProps } from './Simulator';

const {
    results: [{ definition, uuid: flowUUID }]
} = require('../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const Activity = new ActivityManager(flowUUID, jest.fn());

const simulatorProps: ISimulatorProps = {
    definition,
    engineURL: 'https://your-engine.com',
    getFlow: jest.fn(),
    showDefinition: jest.fn(),
    plumberRepaint: jest.fn(),
    Activity
};

const SimulatorShallow = shallow(<Simulator {...simulatorProps} />);

describe('Component: Simulator', () => {
    it('should render', () => {
        expect(SimulatorShallow).toBePresent();
        expect(SimulatorShallow).toHaveState('active', false);
        expect(SimulatorShallow).toHaveState('visible', false);
        expect(SimulatorShallow).toHaveState('events', []);
        expect(SimulatorShallow).toHaveState('active', false);
        expect(SimulatorShallow).toHaveState('contact');
        expect(SimulatorShallow).toHaveState('channel');
    });
});
