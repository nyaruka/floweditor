import * as React from 'react';
import { shallow } from 'enzyme';
import SendEmail from './SendEmail';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , node] } = definition;
const { actions: [, sendEmailAction] } = node;
const { uuid, type, subject, body, emails } = sendEmailAction;

describe('Component: SendEmail', () => {
    it('should render SendEmail with subject prop', () => {
        const SendEmailDivShallow = shallow(<SendEmail {...sendEmailAction} />);

        expect(SendEmailDivShallow.text()).toBe(subject);
    });
});
