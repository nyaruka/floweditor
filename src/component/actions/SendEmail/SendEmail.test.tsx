import * as React from 'react';
import { SendEmail, FlowDefinition } from '../../../flowTypes';
import { createSetup } from '../../../testUtils';
import SendEmailComp from './SendEmail';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , node] } = definition as FlowDefinition;
const { actions: [, sendEmailAction] } = node;

const setup = createSetup<SendEmail>(sendEmailAction as SendEmail, null, SendEmailComp);

const COMPONENT_TO_TEST = SendEmailComp.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it(`should render ${COMPONENT_TO_TEST}, display subject`, () => {
            const { wrapper, props: { subject } } = setup();

            expect(wrapper.text()).toBe(subject);
        });
    });
});
