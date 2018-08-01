import RemoveGroupsForm from '~/components/flow/actions/changegroups/removegroups/RemoveGroupsForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils } from '~/testUtils';
import { createRemoveGroupsAction, SubscribersGroup } from '~/testUtils/assetCreators';

const removeGroupsAction = createRemoveGroupsAction();
const baseProps: ActionFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: removeGroupsAction
    }
};

const { setup } = composeComponentTestUtils(RemoveGroupsForm, baseProps);

describe(RemoveGroupsForm.name, () => {
    describe('render', () => {
        it('should render', () => {
            const { wrapper } = setup(true, {});
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should handle updates and save', () => {
            const { instance, props } = setup(true, { $merge: { updateAction: jest.fn() } });

            instance.handleGroupsChange([SubscribersGroup]);
            instance.handleSave();

            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });

        it('should handle remove from all groups', () => {
            const { instance, props } = setup(true, { $merge: { updateAction: jest.fn() } });

            instance.handleRemoveAllUpdate(true);
            instance.handleSave();

            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });
});
