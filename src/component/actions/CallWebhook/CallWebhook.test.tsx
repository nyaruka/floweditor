import * as React from 'react';
import { shallow } from 'enzyme';
import CallWebhook from './CallWebhook';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , , node] } = definition;
const { actions: [callWebhookAction] } = node;
const { uuid, type, url } = callWebhookAction;

describe('Component: CallWebhook', () => {
    it('should render CallWebhook with url prop', () => {
        const WebhookDivShallow = shallow(<CallWebhook {...callWebhookAction} />);

        expect(WebhookDivShallow.text()).toBe(url);
    });
});
