import { getTypeConfig } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { ChangeGroups } from '../../../flowTypes';
import { composeComponentTestUtils, getSpecWrapper, setMock } from '../../../testUtils';
import { createAddGroupsAction } from '../../../testUtils/assetCreators';
import { set, dump } from '../../../utils';
import { labelSpecId } from './AddGroupsForm';
import { mapGroupsToSearchResults, mapSearchResultsToGroups } from './helpers';
import ChangeGroupFormProps from './props';
import {
    LABEL,
    NOT_FOUND,
    PLACEHOLDER,
    REMOVE_FROM_ALL,
    REMOVE_FROM_ALL_DESC,
    RemoveGroupsForm
} from './RemoveGroupsForm';

const addGroupsAction = createAddGroupsAction();
const removeGroupConfig = getTypeConfig(Types.remove_contact_groups);
const removeGroupsAction = {
    ...(addGroupsAction as ChangeGroups),
    type: Types.remove_contact_groups
};

const baseProps: ChangeGroupFormProps = {
    action: removeGroupsAction,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    groups: [],
    typeConfig: removeGroupConfig
};

const { setup, spyOn } = composeComponentTestUtils(RemoveGroupsForm, baseProps);

describe(RemoveGroupsForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                instance,
                props,
                // tslint:disable-next-line:no-shadowed-variable
                context: { endpoints }
            } = setup(false, {
                onBindWidget: setMock()
            });
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(props.onBindWidget).toHaveBeenCalledTimes(2);
            expect(wrapper.find('GroupsElement').props()).toMatchSnapshot();
            expect(wrapper.find('CheckboxElement').props()).toMatchSnapshot();
        });

        it('should render only the checkbox', () => {
            const {
                wrapper,
                instance,
                props,
                // tslint:disable-next-line:no-shadowed-variable
                context: { endpoints }
            } = setup(false, {
                onBindWidget: setMock(),
                removeWidget: setMock()
            });

            instance.onCheck();

            wrapper.update();

            expect(props.removeWidget).toHaveBeenCalledTimes(1);
            expect(props.removeWidget).toHaveBeenCalledWith('Groups');
            expect(getSpecWrapper(wrapper, labelSpecId).exists()).toBeFalsy();
            expect(wrapper.find('GroupsElement').exists()).toBeFalsy();
            expect(wrapper.find('CheckboxElement').props()).toEqual({
                name: REMOVE_FROM_ALL,
                defaultValue: true,
                description: REMOVE_FROM_ALL_DESC,
                sibling: false,
                onCheck: instance.onCheck
            });
        });
    });

    describe('instance methods', () => {
        describe('getGroups', () => {
            it("should return an empty list if action's groups are null", () => {
                const grouplessAction = { ...removeGroupsAction, groups: null };
                const { wrapper, instance } = setup(true, {
                    action: set(grouplessAction)
                });
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it("should return an empty list if action's groups property is an empty list", () => {
                const grouplessAction = { ...removeGroupsAction, groups: [] };
                const { wrapper, instance } = setup(true, {
                    action: set(grouplessAction)
                });
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return empty list if action is add groups action', () => {
                const { wrapper, instance, props: { action } } = setup(true, {
                    action: set(addGroupsAction)
                });
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return SearchResult[] if action is remove groups action and it has groups', () => {
                const { wrapper, instance, props } = setup();
                const searchResults = mapGroupsToSearchResults(props.action.groups);
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual(searchResults);
                expect(returnedGroups).toMatchSnapshot();
            });
        });

        describe('onGroupsChanged', () => {
            it('should update groups state if passed new groups', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance, props } = setup();
                const searchResults = mapGroupsToSearchResults(props.action.groups.slice(2));

                instance.onGroupsChanged(searchResults);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ groups: searchResults });

                setStateSpy.mockRestore();
            });

            it('should not update groups state if passed same groups', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance, props } = setup();
                const searchResults = mapGroupsToSearchResults(props.action.groups);

                expect(wrapper.state('groups')).toEqual(searchResults);

                instance.onGroupsChanged(searchResults);

                expect(setStateSpy).not.toHaveBeenCalled();

                setStateSpy.mockRestore();
            });
        });

        describe('onValid', () => {
            it('should call updateAction action creator with a ChangeGroups action', () => {
                const {
                    wrapper,
                    instance,
                    props: { action, updateAction: updateActionMock }
                } = setup(true, { updateAction: setMock() });
                const expectedAction = {
                    uuid: action.uuid,
                    type: action.type,
                    groups: mapSearchResultsToGroups(wrapper.state('groups'))
                };
                instance.onValid();
                expect(updateActionMock).toHaveBeenCalledWith(expectedAction);
            });

            it('should honor the remove all flag', () => {
                const {
                    wrapper,
                    instance,
                    props: { action, updateAction: updateActionMock }
                } = setup(true, { updateAction: setMock() });

                // set the remove all flag
                wrapper.setState({ removeFromAll: true });

                // our action shouldn't include any groups
                const expectedAction = {
                    uuid: action.uuid,
                    type: action.type,
                    groups: []
                };

                instance.onValid();
                expect(updateActionMock).toHaveBeenCalledWith(expectedAction);
            });
        });
    });
});
