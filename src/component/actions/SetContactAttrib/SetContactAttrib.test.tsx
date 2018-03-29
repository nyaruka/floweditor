import * as React from 'react';
import { SetContactField, SetContactProperty, FlowDefinition } from '../../../flowTypes';
import { createSetup } from '../../../testUtils';
import SetContactAttribComp from './SetContactAttrib';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , node] } = definition as FlowDefinition;
const { actions: [setContactFieldAction] } = node;

const setup = createSetup<SetContactField>(
    setContactFieldAction as SetContactField,
    null,
    SetContactAttribComp
);

const COMPONENT_TO_TEST = SetContactAttribComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST} with 'update...' div when value prop passed`, () => {
            const { wrapper, props: { field_name, value } } = setup();

            expect(wrapper.text()).toBe(`Update ${field_name} to ${value}`);
        });

        it(`should render ${COMPONENT_TO_TEST} with 'clear...' div when value prop isn't passed`, () => {
            const { wrapper, props: { field_name } } = setup({ value: '' });

            expect(wrapper.text()).toBe(`Clear value for ${field_name}`);
        });
    });
});
