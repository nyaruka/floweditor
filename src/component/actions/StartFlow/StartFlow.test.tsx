import * as React from 'react';
import { FlowDefinition, StartFlow } from '../../../flowTypes';
import { createSetup, Resp } from '../../../testUtils';
import StartFlowComp, { getStartFlowMarkup } from './StartFlow';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json') as Resp;
const { nodes: [, , , , , , node], language: flowLanguage } = definition as FlowDefinition;
const { actions: [startFlowAction] } = node;

const setup = createSetup<StartFlow>(StartFlowComp, startFlowAction as StartFlow);

const COMPONENT_TO_TEST = StartFlowComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST} with flow name`, () => {
            const { wrapper, props: { flow_name } } = setup();

            expect(wrapper.containsMatchingElement(getStartFlowMarkup(flow_name))).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });
    });
});
