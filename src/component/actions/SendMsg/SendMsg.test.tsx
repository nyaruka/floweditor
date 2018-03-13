import * as React from 'react';
import { shallow } from 'enzyme';
import SendMsg from './SendMsg';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { nodes: [node], language: flowLanguage } = definition;
const { actions: [replyAction] } = node;
const { uuid, text } = replyAction;

describe('SendMsg >', () => {
    describe('render >', () => {
        it('should render SendMsg with text prop when passed', () => {
            const wrapper = shallow(<SendMsg {...replyAction} />);

            expect(wrapper.text()).toBe(text);
        });

        it("should render SendMsg with placeholder when text prop isn't passed", () => {
            const wrapper = shallow(<SendMsg {...{ ...replyAction, text: '' }} />);

            expect(wrapper.text()).toBe('Send a message to the contact');
        });
    });
});
