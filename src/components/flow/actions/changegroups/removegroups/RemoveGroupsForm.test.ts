import ChangeGroupFormProps from '~/components/flow/actions/changegroups/props';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { ChangeGroups } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';
import { createAddGroupsAction, SubscribersGroup } from '~/testUtils/assetCreators';

import RemoveGroupsForm from './RemoveGroupsForm';

const addGroupsAction = createAddGroupsAction();
const removeGroupsAction = {
    ...(addGroupsAction as ChangeGroups),
    type: Types.remove_contact_groups
};

const baseProps: ChangeGroupFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: { originalNode: null, originalAction: removeGroupsAction },
    typeConfig: getTypeConfig(Types.remove_contact_groups)
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
