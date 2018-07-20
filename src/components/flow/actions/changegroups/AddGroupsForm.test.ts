import AddGroupsForm, {
    LABEL,
    labelSpecId
} from '~/components/flow/actions/changegroups/AddGroupsForm';
import { AddGroupsFormHelper } from '~/components/flow/actions/changegroups/AddGroupsFormHelper';
import ChangeGroupsFormProps from '~/components/flow/actions/changegroups/props';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import { createAddGroupsAction } from '~/testUtils/assetCreators';

const addGroupsAction = createAddGroupsAction();
const formHelper = new AddGroupsFormHelper();

const baseProps: ChangeGroupsFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: { originalNode: null, originalAction: addGroupsAction },
    typeConfig: getTypeConfig(Types.remove_contact_groups),
    formHelper
};

const { setup, spyOn } = composeComponentTestUtils<ChangeGroupsFormProps>(AddGroupsForm, baseProps);

describe(AddGroupsForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup();
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(wrapper.find('GroupsElement').props()).toMatchSnapshot();
        });
    });
});
