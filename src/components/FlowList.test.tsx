import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import FlowList, { FlowListProps } from './FlowList';

const { results: flowDetails } = require('../../assets/flows.json');

const flows = flowDetails.map(({ uuid, name }) => ({
    uuid,
    name
}));


const flow = {
    name: flowDetails[0].name,
    uuid: flowDetails[0].uuid
};

const props: FlowListProps = {
    onFlowSelect: jest.fn(),
    flow,
    flows
};

describe('Component: FlowList', () => {
    it('should render Select component', () => {
        const Select = shallow(<FlowList {...props} />).find('Select');
        const SelectProps = Select.props();
        expect(SelectProps).toHaveProperty('value', flow);
        expect(SelectProps).toHaveProperty('isLoading', false);
        expect(SelectProps).toHaveProperty('options', flows);
    });
});
