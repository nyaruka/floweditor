import { composeComponentTestUtils, getSpecWrapper, setMock } from '~/testUtils';
import { createAddGroupsAction } from '~/testUtils/assetCreators';
import {
    AddGroupsForm,
    LABEL,
    labelSpecId
} from '~/components/flow/actions/changegroups/AddGroupsForm';
import { AddGroupsFormHelper } from '~/components/flow/actions/changegroups/AddGroupsFormHelper';
import ChangeGroupsFormProps from '~/components/flow/actions/changegroups/props';

const { assets: groups } = require('~/test/assets/groups.json');

const addGroupsAction = createAddGroupsAction();
const formHelper = new AddGroupsFormHelper();

const baseProps: ChangeGroupsFormProps = {
    action: addGroupsAction,
    updateAction: jest.fn(),
    updateChangeGroupsForm: jest.fn(),
    form: formHelper.initializeForm({ originalNode: null, originalAction: addGroupsAction }),
    formHelper,
    groups: []
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

    describe('instance methods', () => {
        describe('onValid', () => {
            it('should call updateAction action creator with a ChangeGroups action', () => {
                const { wrapper, instance, props } = setup(false, { updateAction: setMock() });
                instance.onValid();
                expect(props.updateAction).toHaveBeenCalledWith(addGroupsAction);
            });
        });
    });
});
