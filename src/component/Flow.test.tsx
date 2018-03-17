import * as React from 'react';
import { shallow } from 'enzyme';
import { getSpecWrapper } from '../utils';
import Flow, { FlowProps } from '../component/Flow';
import FlowMutator from '../services/FlowMutator';
import CompMap from '../services/ComponentMap';
import { getBaseLanguage } from '.';

const {
    results: [{ definition }]
} = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { languages, endpoints } = require('../../assets/config');

const baseLanguage = getBaseLanguage(languages);
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

describe('Flow >', () => {
    describe('render >', () => {
        it('should render', () => {
            const wrapper = shallow(<Flow {...props} />, {
                context: {
                    endpoints
                }
            });

            expect(wrapper.exists()).toBeTruthy();
            expect(getSpecWrapper(wrapper, 'nodes').exists()).toBeTruthy();
            expect(getSpecWrapper(wrapper, 'nodes').hasClass('node_list')).toBeTruthy();
            expect(wrapper.find('NodeComp')).toBeTruthy();
        });

        it('should suggest appropriate response names', () => {
            const wrapper = shallow(<Flow {...props} />, {
                context: {
                    endpoints
                }
            });

            const flow = wrapper.instance() as Flow;
            expect(flow.getSuggestedResultName()).toEqual('Response 2');
        });
    });
});
