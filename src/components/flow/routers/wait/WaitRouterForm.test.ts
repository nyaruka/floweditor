import { RouterFormProps } from '~/components/flow/props';
import { Types } from '~/config/interfaces';
import { WaitTypes, HintTypes } from '~/flowTypes';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createRenderNode, getRouterFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';
import WaitRouterForm from '~/components/flow/routers/wait/WaitRouterForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<RouterFormProps>(
    WaitRouterForm,
    getRouterFormProps(
        createRenderNode({
            actions: [],
            exits: [],
            wait: {
                type: WaitTypes.msg,
                hint: {
                    type: HintTypes.audio
                }
            },
            ui: {
                position: { left: 0, top: 0 },
                type: Types.wait_for_response
            }
        })
    )
);

describe(WaitRouterForm.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });
});
