import SendMsgForm, { SendMsgFormProps } from '~/components/flow/actions/sendmsg/SendMsgForm';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { composeComponentTestUtils, mockClear } from '~/testUtils';
import { createSendMsgAction } from '~/testUtils/assetCreators';

const action = createSendMsgAction();
const sendConfig = getTypeConfig(Types.send_broadcast);

const baseProps: SendMsgFormProps = {
    updateAction: jest.fn(),
    typeConfig: sendConfig,
    onClose: jest.fn(),
    onTypeChange: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: action
    }
};

const { setup, spyOn } = composeComponentTestUtils<SendMsgFormProps>(SendMsgForm, baseProps);

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
    });

    describe('cancel', () => {
        it('should cancel without changes', () => {
            const { instance, props } = setup(true);
            mockClear(props.updateAction);
            mockClear(props.onClose);
            instance.handleMessageUpdate("Don't save me bro");
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateAction).not.toHaveBeenCalled();
        });
    });
});
