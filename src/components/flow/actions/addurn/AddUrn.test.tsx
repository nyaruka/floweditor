import AddUrnComp from '~/components/flow/actions/addurn/AddURN';
import { Types } from '~/config/typeConfigs';
import { AddUrn } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';

const baseProps: AddUrn = {
    type: Types.add_input_labels,
    uuid: `${Types.add_input_labels}-0`,
    scheme: 'tel',
    path: '+12065551212'
};

const { setup } = composeComponentTestUtils(AddUrnComp, baseProps);

describe(AddUrnComp.name, () => {
    it('should display urn on action', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
    });
});
