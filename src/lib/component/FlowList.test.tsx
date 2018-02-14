import * as React from 'react';
import { shallow } from 'enzyme';
import FlowList, { FlowListProps } from './FlowList';

const { results: flowDetails } = require('../../assets/flows.json');

const flowOptions = flowDetails.map(({ uuid, name }) => ({
    uuid,
    name
}));

const flowOption = {
    name: flowDetails[0].name,
    uuid: flowDetails[0].uuid
};

const props: FlowListProps = {
    onSelectFlow: jest.fn(),
    flowOption,
    flowOptions
};

describe('FlowList >', () => {
    describe('render >', () =>
        it('should render Select component', () => {
            const wrapper = shallow(<FlowList {...props} />).find('Select');

            expect(wrapper.props()).toEqual(
                expect.objectContaining({
                    value: flowOption,
                    isLoading: false,
                    options: flowOptions
                })
            );
        }));
});
