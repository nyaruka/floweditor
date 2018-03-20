import * as React from 'react';
import { StartFlow, FlowDefinition } from '../../../flowTypes';
import { createSetup } from '../../../testUtils';
import StartFlowComp from './StartFlow';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [, , , , , , node], language: flowLanguage } = definition as FlowDefinition;
const { actions: [startFlowAction] } = node;

const setup = createSetup<StartFlow>(startFlowAction as StartFlow, null, StartFlowComp);

const COMPONENT_TO_TEST = StartFlowComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST} with flow name`, () => {
            const { wrapper, props: { flow_name } } = setup();

            expect(wrapper.text()).toBe(flow_name);
        });
    });
});
