import { labelSpecId } from '~/components/flow/actions/changegroups/AddGroupsForm';
import ChangeGroupFormProps from '~/components/flow/actions/changegroups/props';
import RemoveGroupsForm, { LABEL } from '~/components/flow/actions/changegroups/RemoveGroupsForm';
import { RemoveGroupsFormHelper } from '~/components/flow/actions/changegroups/RemoveGroupsFormHelper';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { ChangeGroups } from '~/flowTypes';
import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import { createAddGroupsAction } from '~/testUtils/assetCreators';

const addGroupsAction = createAddGroupsAction();
const formHelper = new RemoveGroupsFormHelper();
const removeGroupsAction = {
    ...(addGroupsAction as ChangeGroups),
    type: Types.remove_contact_groups
};

const baseProps: ChangeGroupFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: { originalNode: null, originalAction: removeGroupsAction },
    typeConfig: getTypeConfig(Types.remove_contact_groups),
    formHelper
};

const { setup, spyOn } = composeComponentTestUtils(RemoveGroupsForm, baseProps);

describe(RemoveGroupsForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(false, {});
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(wrapper.find('GroupsElement').props()).toMatchSnapshot();
            expect(wrapper.find('CheckboxElement').props()).toMatchSnapshot();
        });

        it('should render only the checkbox', () => {});
    });
});
