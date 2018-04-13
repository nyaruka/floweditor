import { FlowDefinition, StartFlow } from '../../../flowTypes';
import { composeComponentTestUtils, Resp, genStartFlowAction } from '../../../testUtils';
import StartFlowComp, { getStartFlowMarkup } from './StartFlow';

const startFlowAction = genStartFlowAction();

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
