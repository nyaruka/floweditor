import AddGroupsForm from '~/components/flow/actions/changegroups/addgroups/AddGroupsForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils, mock } from '~/testUtils';
import {
    createAddGroupsAction,
    getActionFormProps,
    SubscribersGroup
} from '~/testUtils/assetCreators';
import * as utils from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

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
            expect(props.updateAction).toMatchCallSnapshot('update');
        });

        it('should allow switching from router', () => {
            const { instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            instance.handleGroupsChange([SubscribersGroup]);
            instance.handleSave();
            expect(props.updateAction).toMatchSnapshot('switch from router');
        });
    });
});
