import { Types } from '../../../config/typeConfigs';
import { ChangeGroups } from '../../../flowTypes';
import { updateChangeGroupsForm } from '../../../store/forms';
import { composeComponentTestUtils, getSpecWrapper, setMock } from '../../../testUtils';
import { createAddGroupsAction } from '../../../testUtils/assetCreators';
import { labelSpecId } from './AddGroupsForm';
import { mapGroupsToAssets } from './helpers';
import ChangeGroupFormProps from './props';
import { LABEL, REMOVE_FROM_ALL, REMOVE_FROM_ALL_DESC, RemoveGroupsForm } from './RemoveGroupsForm';
import { RemoveGroupsFormHelper } from './RemoveGroupsFormHelper';

const addGroupsAction = createAddGroupsAction();
const formHelper = new RemoveGroupsFormHelper();
const removeGroupsAction = {
    ...(addGroupsAction as ChangeGroups),
    type: Types.remove_contact_groups
};

const baseProps: ChangeGroupFormProps = {
    action: removeGroupsAction,
    updateAction: jest.fn(),
    updateChangeGroupsForm: jest.fn(),
    form: formHelper.initializeForm({ originalNode: null, originalAction: removeGroupsAction }),
    formHelper,
    groups: []
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

        it('should render only the checkbox', () => {
            const { wrapper, instance } = setup(false, { form: { removeAll: { $set: true } } });
            expect(getSpecWrapper(wrapper, labelSpecId).exists()).toBeFalsy();
            expect(wrapper.find('GroupsElement').exists()).toBeFalsy();
            expect(wrapper.find('CheckboxElement').props()).toEqual({
                labelClassName: '',
                name: REMOVE_FROM_ALL,
                title: REMOVE_FROM_ALL,
                checked: true,
                description: REMOVE_FROM_ALL_DESC,
                onChange: instance.handleUpdateRemoveAll
            });
        });
    });

    describe('instance methods', () => {
        it('should handle removeAll', () => {
            const { wrapper, instance, props } = setup(true, {
                $merge: { updateChangeGroupsForm: jest.fn().mockReturnValue(true) }
            });
            instance.handleUpdateRemoveAll(true);
            expect(props.updateChangeGroupsForm).toHaveBeenCalledWith({
                groups: { value: null },
                removeAll: true
            });
        });

        describe('handleUpdateGroups', () => {
            it('should update groups state if passed new groups', () => {
                const { wrapper, instance, props } = setup(true, {
                    $merge: { updateChangeGroupsForm: jest.fn().mockReturnValue(true) }
                });
                const searchResults = mapGroupsToAssets(props.action.groups.slice(2));

                instance.handleUpdateGroups(searchResults);

                expect(props.updateChangeGroupsForm).toHaveBeenCalledWith({
                    groups: {
                        value: [
                            {
                                id: 'cdbf9e01-aaa7-4381-8259-ee042447bcac',
                                name: 'Early Adopters',
                                type: 'group'
                            },
                            {
                                id: 'afaba971-8943-4dd8-860b-3561ed4f1fe1',
                                name: 'Testers',
                                type: 'group'
                            },
                            {
                                id: '33b28bac-b588-43e4-90de-fda77aeaf7c0',
                                name: 'Subscribers',
                                type: 'group'
                            }
                        ]
                    }
                });
            });
        });

        describe('onValid', () => {
            it('should call updateAction action creator with a ChangeGroups action', () => {
                const { instance, props } = setup(true, { updateAction: setMock() });
                instance.onValid();
                expect(props.updateAction).toHaveBeenCalledWith({
                    groups: [
                        { name: 'Customers', uuid: '23ff7152-b588-43e4-90de-fda77aeaf7c0' },
                        {
                            name: 'Unsatisfied Customers',
                            uuid: '2429d573-80d7-47f8-879f-f2ba442a1bfd'
                        },
                        { name: 'Early Adopters', uuid: 'cdbf9e01-aaa7-4381-8259-ee042447bcac' },
                        { name: 'Testers', uuid: 'afaba971-8943-4dd8-860b-3561ed4f1fe1' },
                        { name: 'Subscribers', uuid: '33b28bac-b588-43e4-90de-fda77aeaf7c0' }
                    ],
                    type: 'remove_contact_groups',
                    uuid: 'add_contact_groups-0'
                });
            });
        });
    });
});
