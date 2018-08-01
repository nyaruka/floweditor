import AddGroupsForm from '~/components/flow/actions/changegroups/addgroups/AddGroupsForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils } from '~/testUtils';
import { createAddGroupsAction, SubscribersGroup } from '~/testUtils/assetCreators';

const addGroupsAction = createAddGroupsAction();

const baseProps: ActionFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: addGroupsAction
    }
};

const { setup } = composeComponentTestUtils<ActionFormProps>(AddGroupsForm, baseProps);

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
