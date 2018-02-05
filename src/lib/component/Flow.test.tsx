import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper, jsonEqual } from '../utils';
import Flow, { FlowProps } from '../component/Flow';
import { getBaseLanguage } from './FlowEditor';
import FlowMutator from '../services/FlowMutator';
import CompMap from '../services/ComponentMap';

const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const config = require('../../../assets/config.json');

const baseLanguage = getBaseLanguage(config.languages);
const language = { iso: 'eng', name: 'English' };
const ComponentMap = new CompMap(definition);
const Mutator = new FlowMutator(ComponentMap, definition, jest.fn(), jest.fn());
const props: FlowProps = {
    nodeDragging: false,
    onDrag: jest.fn(),
    language,
    translating: !jsonEqual(baseLanguage, language),
    definition,
    dependencies: null,
    Mutator,
    ComponentMap
};

describe('Component: Flow', () => {
    it('should render', () => {
        const wrapper = shallow(<Flow {...props} />, { context: config });

        expect(getSpecWrapper(wrapper, 'nodes').exists()).toBeTruthy();
        expect(
            getSpecWrapper(wrapper, 'nodes').hasClass('node_list')
        ).toBeTruthy();
        expect(wrapper.find('NodeComp')).toBeTruthy();
    });
});
