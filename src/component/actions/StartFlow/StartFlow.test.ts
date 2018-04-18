import { StartFlow } from '../../../flowTypes';
import { composeComponentTestUtils } from '../../../testUtils';
import { createStartFlowAction } from '../../../testUtils/assetCreators';
import StartFlowComp, { getStartFlowMarkup } from './StartFlow';

const startFlowAction = createStartFlowAction();

const { setup } = composeComponentTestUtils<StartFlow>(StartFlowComp, startFlowAction as StartFlow);

describe(StartFlowComp.name, () => {
    describe('render', () => {
        it('should render flow name', () => {
            const { wrapper, props } = setup();

            expect(
                wrapper.containsMatchingElement(getStartFlowMarkup(props.flow_name))
            ).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });
    });
});
