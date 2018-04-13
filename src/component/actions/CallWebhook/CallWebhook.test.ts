import { CallWebhook, FlowDefinition, Methods } from '../../../flowTypes';
import { composeComponentTestUtils, genCallWebhookAction } from '../../../testUtils';
import CallWebhookComp from './CallWebhook';

const callWebhookAction = genCallWebhookAction();

const { setup } = composeComponentTestUtils<CallWebhook>(
    CallWebhookComp,
    callWebhookAction as CallWebhook
);

describe(CallWebhookComp.name, () => {
    describe('render', () => {
        it('should render self', () => {
            const { wrapper, props } = setup();

            expect(wrapper.text()).toBe(props.url);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
