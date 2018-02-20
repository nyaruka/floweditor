import * as React from 'react';
import { shallow } from 'enzyme';
import SaveToContact from './SaveToContact';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , node] } = definition;
const { actions: [saveToContactAction] } = node;
const { uuid, type, field_name, value } = saveToContactAction;

describe('SaveToContactComp >', () => {
    describe('render >', () => {
        it("should render base SaveToContactComp with 'update...' div when value prop passed", () => {
            const wrapper = shallow(<SaveToContact {...saveToContactAction} />);

            expect(wrapper.text()).toBe(`Update ${field_name} to ${value}`);
        });

        it("should render base SaveToContactComp with 'clear...' div when value prop isn't passed", () => {
            const wrapper = shallow(<SaveToContact {...{ ...saveToContactAction, value: '' }} />);

            expect(wrapper.text()).toBe(`Clear value for ${field_name}`);
        });
    });
});
