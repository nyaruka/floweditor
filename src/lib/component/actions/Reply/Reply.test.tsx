import * as React from 'react';
import { shallow } from 'enzyme';
import Reply, { REPLY_LABEL } from './Reply';

const {
    results: [{ definition }]
} = require('../../../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [node], language: flowLanguage } = definition;
const { actions: [replyAction] } = node;
const { uuid, text } = replyAction;

describe('Component: Reply', () => {
    it('should render Reply with text prop when passed', () => {
        const wrapper = shallow(<Reply {...replyAction} />);

        expect(wrapper.text()).toBe(text);
    });

    it("should render Reply with placeholder when text prop isn't passed", () => {
        const wrapper = shallow(<Reply {...{ ...replyAction, text: '' }} />);

        expect(wrapper.text()).toBe(REPLY_LABEL);
    });
});
