import RemoveGroupsForm from '~/components/flow/actions/changegroups/removegroups/RemoveGroupsForm';
import { ActionFormProps } from '~/components/flow/props';
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
            const components = setup(true, { $merge: { updateAction: jest.fn() } });

            const instance: RemoveGroupsForm = components.instance;
            const props: Partial<ActionFormProps> = components.props;

            instance.handleGroupsChanged([SubscribersGroup]);
            instance.handleSave();

            expect(props.updateAction).toHaveBeenCalled();
            expect(props.updateAction).toMatchCallSnapshot('update');
        });

        it('should handle remove from all groups', () => {
            const components = setup(true, { $merge: { updateAction: jest.fn() } });

            const instance: RemoveGroupsForm = components.instance;
            const props: Partial<ActionFormProps> = components.props;

            instance.handleRemoveAllUpdate(true);
            instance.handleSave();

            expect(props.updateAction).toHaveBeenCalled();
            expect(props.updateAction).toMatchCallSnapshot('update');
        });

        it('should allow switching from router', () => {
            const components = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            const instance: RemoveGroupsForm = components.instance;
            const props: Partial<ActionFormProps> = components.props;

            instance.handleGroupsChanged([SubscribersGroup]);
            instance.handleSave();
            expect(props.updateAction).toMatchCallSnapshot('switch from router');
        });
    });
});
