import { RouterFormProps } from '~/components/flow/props';
import { Types } from '~/config/interfaces';
import { WaitTypes, HintTypes, RouterTypes } from '~/flowTypes';
import { composeComponentTestUtils, mock } from '~/testUtils';
import {
    createRenderNode,
    getRouterFormProps,
    createMatchCase,
    createMatchRouter
} from '~/testUtils/assetCreators';
import * as utils from '~/utils';
import WaitRouterForm from '~/components/flow/routers/wait/WaitRouterForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createMatchRouter([]);
routerNode.node.router.wait = {
    type: WaitTypes.msg,
    hint: {
        type: HintTypes.audio
    }
};

routerNode.ui.type = Types.wait_for_audio;

const { setup } = composeComponentTestUtils<RouterFormProps>(
    WaitRouterForm,
    getRouterFormProps(routerNode)
);

describe(WaitRouterForm.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });
});
