import { RouterFormProps } from '~/components/flow/props';
import MenuRouterForm from '~/components/flow/routers/menu/MenuRouterForm';
import { Types } from '~/config/typeConfigs';
import { RouterTypes } from '~/flowTypes';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createRenderNode, getRouterFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

const { setup } = composeComponentTestUtils<RouterFormProps>(
    MenuRouterForm,
    getRouterFormProps(
        createRenderNode({
            actions: [],
            exits: [],
            router: {
                type: RouterTypes.switch,
                cases: []
            },
            ui: {
                position: { left: 0, top: 0 },
                type: Types.wait_for_menu
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
