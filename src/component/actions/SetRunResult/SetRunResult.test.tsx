import * as React from 'react';
import { SetRunResult, FlowDefinition } from '../../../flowTypes';
import { createSetup } from '../../../testUtils';
import SetRunResultComp from './SetRunResult';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , node] } = definition as FlowDefinition;
const { actions: [setRunResultAction] } = node;

const setup = createSetup<SetRunResult>(setRunResultAction as SetRunResult, null, SetRunResultComp);

const COMPONENT_TO_TEST = SetRunResultComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    it(`should render ${COMPONENT_TO_TEST} with 'save...' div when value prop passed`, () => {
        const { wrapper, props: { value, result_name } } = setup();

        expect(wrapper.text()).toBe(`Save ${value} as ${result_name}`);
    });

    it(`should render ${COMPONENT_TO_TEST} with 'clear...' div when value prop isn't passed`, () => {
        const { wrapper, props: { result_name } } = setup({ value: '' });

        expect(wrapper.text()).toBe(`Clear value for ${result_name}`);
    });
});
