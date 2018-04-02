import * as React from 'react';
import { CallWebhook, FlowDefinition } from '../../../flowTypes';
import { createSetup, Resp } from '../../../testUtils';
import CallWebhookComp from './CallWebhook';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json') as Resp;

const { language: flowLanguage, nodes: [, , , , , node] } = definition as FlowDefinition;
const { actions: [callWebhookAction] } = node;

const setup = createSetup<CallWebhook>(CallWebhookComp, callWebhookAction as CallWebhook);

const COMPONENT_TO_TEST = CallWebhookComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST} with url prop`, () => {
            const { wrapper, props: { url } } = setup();

            expect(wrapper.text()).toBe(url);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
