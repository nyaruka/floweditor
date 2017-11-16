import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import EditorConfig from '../services/EditorConfig';
import FlowList, { FlowListProps } from './FlowList';

const { results: flowDetails } = require('../../assets/flows.json');

export const flowListProps: FlowListProps = {
    fetching: true,
    EditorConfig: new EditorConfig(),
    External: {
        getFlows: jest.fn(
            () => new Promise((resolve, reject) => process.nextTick(() => resolve(flowDetails)))
        )
    } as any,
    onFlowSelect: jest.fn()
};

const FlowListShallow = shallow(<FlowList {...flowListProps} />);
const FlowListDiv = FlowListShallow.find('#flow-list');
const FlowSelector = FlowListShallow.find('Select');

describe('Component: FlowList', () => {
    it('should mount', () => {
        const { External: { getFlows } } = flowListProps;

        expect(FlowListShallow.exists()).toBeTruthy();
        expect(getFlows).toBeCalled();
        expect(FlowListShallow.state('flows')).toEqual(flowDetails);
        expect(FlowListDiv.exists()).toBeTruthy();
        expect(FlowSelector.exists()).toBeTruthy();
    });
});
