import StartSessionForm, {
    StartSessionFormProps
} from '~/components/flow/actions/startsession/StartSessionForm';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { AssetType } from '~/services/AssetService';
import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import { createStartSessionAction, SubscribersGroup } from '~/testUtils/assetCreators';

const { assets: groups } = require('~/test/assets/groups.json');

const startSessionAction = createStartSessionAction();
const typeConfig = getTypeConfig(Types.start_session);

const baseProps: StartSessionFormProps = {
    typeConfig,
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: { originalNode: null, originalAction: startSessionAction }
};

const { setup, spyOn } = composeComponentTestUtils<StartSessionFormProps>(
    StartSessionForm,
    baseProps
);

describe(StartSessionForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(true);
            expect(getSpecWrapper(wrapper, 'recipients').html()).toContain('Rowan Seymour');
            expect(wrapper).toMatchSnapshot();
        });

        it('should render an empty form with no action', () => {
            const { wrapper, instance } = setup(true, {
                $merge: {
                    nodeSettings: { originalNode: null, originalAction: null }
                }
            });

            expect(instance.state).toMatchSnapshot();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should save changes', () => {
            const { instance, props } = setup(true);

            instance.handleRecipientsChanged([SubscribersGroup]);
            instance.handleFlowChanged([{ id: 'my_flow', name: 'My Flow', type: AssetType.Flow }]);
            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });

    describe('cancel', () => {
        it('should cancel without changes', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateAction: jest.fn() }
            });

            instance.handleRecipientsChanged([SubscribersGroup]);
            instance.handleFlowChanged([{ id: 'my_flow', name: 'My Flow', type: AssetType.Flow }]);
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateAction).not.toHaveBeenCalled();
        });
    });
});
