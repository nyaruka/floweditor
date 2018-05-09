import { getTypeConfig } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { composeComponentTestUtils, getSpecWrapper } from '../../../testUtils';
import { createBroadcastMsgAction } from '../../../testUtils/assetCreators';
import { SendBroadcastForm, SendBroadcastFormProps } from './SendBroadcastForm';
import { SendBroadcastFormHelper } from './SendBroadcastFormHelper';

const { assets: groups } = require('../../../../__test__/assets/groups.json');

const broadcastMsgAction = createBroadcastMsgAction();
const sendConfig = getTypeConfig(Types.send_broadcast);

const formHelper = new SendBroadcastFormHelper();

const baseProps: SendBroadcastFormProps = {
    action: broadcastMsgAction,
    formHelper,
    updateAction: jest.fn(),
    typeConfig: sendConfig,
    language: null,
    translating: false,
    definition: null,
    localizations: [],
    updateLocalizations: jest.fn(),
    updateSendBroadcastForm: jest.fn(),
    onBindWidget: jest.fn(),
    form: formHelper.actionToState(broadcastMsgAction)
};

const { setup, spyOn } = composeComponentTestUtils<SendBroadcastFormProps>(
    SendBroadcastForm,
    baseProps
);

describe(SendBroadcastForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(true);
            expect(getSpecWrapper(wrapper, 'recipients').html()).toContain('Rowan Seymour');
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('onValid', () => {
        const { wrapper, instance, props } = setup(true);
        instance.onValid();
        expect(props.updateAction).toBeCalledWith(broadcastMsgAction);
    });
});
