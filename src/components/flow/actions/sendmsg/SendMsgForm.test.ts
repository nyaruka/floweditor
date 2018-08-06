import SendMsgForm from '~/components/flow/actions/sendmsg/SendMsgForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createSendMsgAction, getActionFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

const { setup } = composeComponentTestUtils<ActionFormProps>(
    SendMsgForm,
    getActionFormProps(createSendMsgAction())
);

mock(utils, 'createUUID', utils.seededUUIDs());

describe(SendMsgForm.name, () => {
    describe('render', () => {
        it('should render', () => {
            const { wrapper } = setup(true);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should save changes', () => {
            const { instance, props } = setup(true);

            instance.handleMessageUpdate('What is your favorite color?');
            instance.handleQuickRepliesUpdate(['red', 'green', 'blue']);
            instance.handleSendAllUpdate(true);

            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });

        it('should allow switching from router', () => {
            const { instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            instance.handleMessageUpdate('What is your favorite color?');
            instance.handleSave();

            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });

    describe('cancel', () => {
        it('should cancel without changes', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateAction: jest.fn() }
            });
            instance.handleMessageUpdate("Don't save me bro");
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateAction).not.toHaveBeenCalled();
        });
    });
});
