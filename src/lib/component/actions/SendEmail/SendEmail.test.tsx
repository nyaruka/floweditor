import * as React from 'react';
import { shallow } from 'enzyme';
import SendEmail from './SendEmail';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , , , node] } = definition;
const { actions: [, sendEmailAction] } = node;
const { uuid, type, subject, body, emails } = sendEmailAction;

describe('SendEmail >', () => {
    describe('render >', () => {
        it('should render SendEmail with subject prop', () => {
            const wrapper = shallow(<SendEmail {...sendEmailAction} />);

            expect(wrapper.text()).toBe(subject);
        });
    });
});
