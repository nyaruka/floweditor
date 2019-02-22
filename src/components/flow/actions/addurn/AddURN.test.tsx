import AddURNComp from '~/components/flow/actions/addurn/AddURN';
import { Types } from '~/config/typeConfigs';
import { AddURN } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';

const baseProps: AddURN = {
    type: Types.add_input_labels,
    uuid: `${Types.add_contact_urn}-0`,
    scheme: 'tel',
    path: '+12065551212'
};

const { setup } = composeComponentTestUtils(AddURNComp, baseProps);

describe(AddURNComp.name, () => {
    it('should display urn on action', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
    });
});
