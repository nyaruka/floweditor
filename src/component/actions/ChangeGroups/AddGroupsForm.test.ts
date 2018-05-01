import { getTypeConfig } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { composeComponentTestUtils, getSpecWrapper, setMock } from '../../../testUtils';
import { createAddGroupsAction } from '../../../testUtils/assetCreators';
import { set } from '../../../utils';
import { GROUP_NOT_FOUND } from '../../form/GroupsElement';
import { AddGroupsForm, LABEL, labelSpecId, PLACEHOLDER } from './AddGroupsForm';
import ChangeGroupsFormProps from './props';
import { mapGroupsToAssets, mapAssetsToGroups } from './helpers';

const { assets: groups } = require('../../../../__test__/assets/groups.json');

const addGroupsAction = createAddGroupsAction();
const addGroupConfig = getTypeConfig(Types.add_contact_groups);
const removeGroupConfig = getTypeConfig(Types.remove_contact_groups);

const baseProps: ChangeGroupsFormProps = {
    action: addGroupsAction,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    groups: [],
    typeConfig: addGroupConfig
};

const { setup, spyOn } = composeComponentTestUtils<ChangeGroupsFormProps>(AddGroupsForm, baseProps);

describe(AddGroupsForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                props,
                // tslint:disable-next-line:no-shadowed-variable
                context,
                instance
            } = setup(false, {
                onBindWidget: setMock()
            });
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(props.onBindWidget).toHaveBeenCalledTimes(1);
            expect(wrapper.find('GroupsElement').props()).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('getGroups', () => {
            it("should return an empty list if action's groups are null", () => {
                const grouplessAction = { ...addGroupsAction, groups: null };
                const { wrapper, instance } = setup(true, {
                    action: set(grouplessAction)
                });

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it("should return an empty list if action's groups property is an empty list", () => {
                const grouplessAction = { ...addGroupsAction, groups: [] };
                const { wrapper, instance } = setup(true, {
                    action: set(grouplessAction)
                });

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return empty list if action is remove groups action', () => {
                const removeGroupsAction = {
                    ...addGroupsAction,
                    type: Types.remove_contact_groups
                };
                const { wrapper, instance } = setup(true, {
                    action: set(removeGroupsAction)
                });
                const groupOptions = instance.getGroups();

                expect(groupOptions).toEqual([]);
                expect(groupOptions).toMatchSnapshot();
            });

            it('should return SearchResult[] if action is add groups action and it has groups', () => {
                const { wrapper, instance, props } = setup();
                const searchResults = mapGroupsToAssets(props.action.groups);
                const groupOptions = instance.getGroups();

                expect(groupOptions).toEqual(searchResults);
                expect(groupOptions).toMatchSnapshot();
            });
        });

        describe('onGroupsChanged', () => {
            it('should update state if called with new groups', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();
                const newSearchResults = mapGroupsToAssets([
                    ...groups,
                    { name: 'Unsubscibed', uuid: 'unsubscribed-0' }
                ]);

                instance.onGroupsChanged(newSearchResults);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ groups: newSearchResults });

                setStateSpy.mockRestore();
            });

            it('should not update state if called with same groups', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance, props } = setup();
                const searchResults = mapGroupsToAssets(props.action.groups);

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
                    groups: mapAssetsToGroups(wrapper.state('groups'))
                };

                instance.onValid();

                expect(updateActionMock).toHaveBeenCalledWith(expectedAction);
            });
        });
    });
});
