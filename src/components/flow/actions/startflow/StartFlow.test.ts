import { StartFlow } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';
import { createStartFlowAction } from '~/testUtils/assetCreators';
import StartFlowComp from '~/components/flow/actions/startflow/StartFlow';

const startFlowAction = createStartFlowAction();

const { setup } = composeComponentTestUtils<StartFlow>(StartFlowComp, startFlowAction as StartFlow);

describe(StartFlowComp.name, () => {
    describe('render', () => {
        it('should render flow name', () => {
            const { wrapper, props } = setup();
            expect(wrapper.text()).toEqual(startFlowAction.flow.name);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
