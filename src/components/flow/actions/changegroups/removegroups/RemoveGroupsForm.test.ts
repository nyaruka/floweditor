import RemoveGroupsForm from '~/components/flow/actions/changegroups/removegroups/RemoveGroupsForm';
import { composeComponentTestUtils, mock } from '~/testUtils';
import {
    createRemoveGroupsAction,
    getActionFormProps,
    SubscribersGroup
} from '~/testUtils/assetCreators';
import * as utils from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils(
    RemoveGroupsForm,
    getActionFormProps(createRemoveGroupsAction())
);

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

        it('should allow switching from router', () => {
            const { instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            instance.handleGroupsChange([SubscribersGroup]);
            instance.handleSave();

            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });
});
