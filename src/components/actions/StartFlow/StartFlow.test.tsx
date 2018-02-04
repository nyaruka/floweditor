import * as React from 'react';
import { shallow } from 'enzyme';
import StartFlow from './StartFlow';

const {
    results: [{ definition }]
} = require('../../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [, , , , , , node], language: flowLanguage } = definition;
const { actions: [startFlowAction] } = node;
const { uuid, type, flow_name, flow_uuid } = startFlowAction;

describe('StartFlow >', () => {
    describe('render >', () => {
        it('should render StartFlow with flow name', () => {
            const StartFlowDivShallow = shallow(<StartFlow {...startFlowAction} />);

            expect(StartFlowDivShallow.text()).toBe(flow_name);
        });
    });
});
