import AddGroupsForm from '~/components/flow/actions/changegroups/addgroups/AddGroupsForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils } from '~/testUtils';
import {
    createAddGroupsAction,
    getActionFormProps,
    SubscribersGroup
} from '~/testUtils/assetCreators';

const { setup } = composeComponentTestUtils<ActionFormProps>(
    AddGroupsForm,
    getActionFormProps(createAddGroupsAction())
);

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
