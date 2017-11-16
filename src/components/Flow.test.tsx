import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import Flow, { IFlowProps } from '../components/Flow';
import EditorConfig from '../services/EditorConfig';
import External from '../services/External';
import FlowMutator from '../services/FlowMutator';
import CompMap from '../services/ComponentMap';

const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const ComponentMap = new CompMap(definition);

const Mutator = new FlowMutator(ComponentMap, definition, jest.fn(), jest.fn());

const flowProps: IFlowProps = {
    EditorConfig: new EditorConfig(),
    External: new External(),
    definition,
    dependencies: null,
    Mutator,
    ComponentMap
};

const FlowShallow = shallow(<Flow {...flowProps} />);

describe('Component: Flow', () => {
    it('should render', () => {
        const { EditorConfig: { baseLanguage } } = flowProps;

        expect(FlowShallow.exists()).toBeTruthy();
        expect(FlowShallow.state('language')).toEqual(baseLanguage);
        expect(FlowShallow.state('translating')).toBeFalsy();
    });
});
