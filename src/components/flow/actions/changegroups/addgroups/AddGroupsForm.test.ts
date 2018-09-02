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
            const component = setup();

            const instance: AddGroupsForm = component.instance;
            const props: Partial<ActionFormProps> = component.props;

            instance.handleGroupsChanged([SubscribersGroup]);
            instance.handleSave();

            expect(props.updateAction).toHaveBeenCalled();
            expect(props.updateAction).toMatchCallSnapshot('update');
        });

        it('should allow switching from router', () => {
            const component = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            const instance: AddGroupsForm = component.instance;
            const props: Partial<ActionFormProps> = component.props;

            instance.handleGroupsChanged([SubscribersGroup]);
            instance.handleSave();
            expect(props.updateAction).toMatchSnapshot('switch from router');
        });
    });
});
