import * as React from 'react';
import { shallow } from 'enzyme';
import Webhook from './Webhook';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , , node] } = definition;
const { actions: [webhookAction] } = node;
const { uuid, type, url } = webhookAction;

describe('Webhook >', () => {
    describe('render >', () => {
        it('should render Webhook with url prop', () => {
            const wrapper = shallow(<Webhook {...webhookAction} />);

            expect(wrapper.text()).toBe(url);
        });
    });
});
