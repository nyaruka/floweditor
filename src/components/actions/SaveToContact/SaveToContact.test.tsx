import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import SaveToContact from './SaveToContact';

const { results: [{ definition }]} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { language: flowLanguage, nodes: [, , node] } = definition;
const { actions: [saveToContactAction] } = node;
const { uuid, type, field_name, value } = saveToContactAction;

describe('Component: SaveToContactComp', () => {
    it("should render base SaveToContactComp with 'update...' div when value prop passed", () => {
        const SaveToContactDivShallow = shallow(<SaveToContact {...saveToContactAction} />);

        expect(SaveToContactDivShallow.text()).toBe(`Update ${field_name} to ${value}`);
    });

    it("should render base SaveToContactComp with 'clear...' div when value prop isn't passed", () => {
        const SaveToContactDivShallow = shallow(<SaveToContact {...{...saveToContactAction, value: ''}} />);

        expect(SaveToContactDivShallow.text()).toBe(`Clear value for ${field_name}`);
    });
});
