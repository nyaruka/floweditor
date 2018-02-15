import * as React from 'react';
import { shallow } from 'enzyme';
import Reply from './Reply';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [node], language: flowLanguage } = definition;
const { actions: [replyAction] } = node;
const { uuid, text } = replyAction;

describe('Component: Reply', () => {
    it('should render Reply with text prop when passed', () => {
        const ReplyDivShallow = shallow(<Reply {...replyAction} />);

        expect(ReplyDivShallow.text()).toBe(text);
    });

    it("should render Reply with placeholder when text prop isn't passed", () => {
        const ReplyDivShallow = shallow(<Reply {...{ ...replyAction, text: '' }} />);

        expect(ReplyDivShallow.text()).toBe('Send a message to the contact');
    });
});
