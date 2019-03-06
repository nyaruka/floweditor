import { RouterFormProps } from '~/components/flow/props';
import MenuRouterForm from '~/components/flow/routers/menu/MenuRouterForm';
import { Types } from '~/config/interfaces';
import { HintTypes, RouterTypes, WaitTypes } from '~/flowTypes';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createRenderNode, getRouterFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

const { setup } = composeComponentTestUtils<RouterFormProps>(
    MenuRouterForm,
    getRouterFormProps(
        createRenderNode({
            actions: [],
            exits: [],
            wait: {
                type: WaitTypes.msg,
                hint: { type: HintTypes.digits, count: 1 }
            },
            router: {
                type: RouterTypes.switch,
                cases: []
            },
            ui: {
                position: { left: 0, top: 0 },
                type: Types.wait_for_response
            }
        })
    )
);

mock(utils, 'createUUID', utils.seededUUIDs());

describe(MenuRouterForm.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });
});
