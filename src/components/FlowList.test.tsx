import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import { FlowList, IFlowListProps } from './FlowList';

const { results: flowDetails } = require('../../assets/flows.json');

export const flowListProps: IFlowListProps = {
    getFlows: jest.fn(
        () => new Promise((resolve, reject) => process.nextTick(() => resolve(flowDetails)))
    ),
    onFlowSelect: jest.fn()
};

const FlowListShallow = shallow(<FlowList {...flowListProps} />);

describe('Component: FlowList', () => {
    it('should mount', () => {
        const { getFlows } = flowListProps;

        expect(FlowListShallow).toBePresent();
        expect(getFlows).toBeCalled();
        expect(FlowListShallow).toHaveState('flows', flowDetails);
        expect(FlowListShallow).toHaveState('show', true);
    });
});
