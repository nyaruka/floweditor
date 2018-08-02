import SendBroadcastForm from '~/components/flow/actions/sendbroadcast/SendBroadcastForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import { createBroadcastMsgAction, getActionFormProps } from '~/testUtils/assetCreators';

const action = createBroadcastMsgAction();
const { setup } = composeComponentTestUtils<ActionFormProps>(
    SendBroadcastForm,
    getActionFormProps(action)
);

describe(SendBroadcastForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(true);
            expect(getSpecWrapper(wrapper, 'recipients').html()).toContain('Rowan Seymour');
            expect(wrapper).toMatchSnapshot();
        });

        it('should render an empty form with no action', () => {
            const { wrapper, instance } = setup(true, {
                $merge: {
                    nodeSettings: { originalNode: null }
                }
            });

            expect(instance.state).toMatchSnapshot();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('event', () => {
        it('handles recipent change', () => {
            const { instance } = setup(true, {
                $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
            });
            instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
            expect(instance.state).toMatchSnapshot();
        });

        it('handles text change', () => {
            const { instance, props } = setup(true, {
                $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
            });
            instance.handleMessageUpdate('Message to Group');
            expect(instance.state).toMatchSnapshot();
        });
    });
});
