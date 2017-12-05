import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../helpers/utils';
import Flow, { FlowProps } from '../components/Flow';
import FlowMutator from '../services/FlowMutator';
import CompMap from '../services/ComponentMap';
import context from '../providers/ConfigProvider/configContext';

const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const { baseLanguage } = context;
const language = { iso: 'eng', name: 'English' };
const ComponentMap = new CompMap(definition);
const Mutator = new FlowMutator(ComponentMap, definition, jest.fn(), jest.fn());
const props: FlowProps = {
    nodeDragging: false,
    onDrag: jest.fn(),
    language,
    translating: baseLanguage.iso !== language.iso && baseLanguage.name === language.name,
    definition,
    dependencies: null,
    Mutator,
ComponentMap
};
const FlowComp = shallow(<Flow {...props} />, { context });

describe('Component: Flow', () => {
    it('should render', () => {
        expect(FlowComp.exists()).toBeTruthy();
        expect(getSpecWrapper(FlowComp, 'nodes').exists()).toBeTruthy();
        expect(getSpecWrapper(FlowComp, 'nodes').hasClass('node_list')).toBeTruthy();
        expect(FlowComp.find('NodeComp')).toBeTruthy();
    });
});
