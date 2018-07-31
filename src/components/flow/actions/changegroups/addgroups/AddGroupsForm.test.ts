import AddGroupsForm from '~/components/flow/actions/changegroups/addgroups/AddGroupsForm';
import ChangeGroupsFormProps from '~/components/flow/actions/changegroups/props';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { composeComponentTestUtils } from '~/testUtils';
import { createAddGroupsAction, SubscribersGroup } from '~/testUtils/assetCreators';

const addGroupsAction = createAddGroupsAction();

const baseProps: ChangeGroupsFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: { originalNode: null, originalAction: addGroupsAction },
    typeConfig: getTypeConfig(Types.remove_contact_groups)
};

const { setup } = composeComponentTestUtils<ChangeGroupsFormProps>(AddGroupsForm, baseProps);

describe(AddGroupsForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should handle updates and save', () => {
            const { instance, props } = setup();

            instance.handleGroupsChange([SubscribersGroup]);
            instance.handleSave();

            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });
});
