import { getTypeConfig } from '../../../config';
import { FlowEditorConfig, Group, ChangeGroups } from '../../../flowTypes';
import { createSetup, getSpecWrapper, Resp } from '../../../testUtils';
import { GROUP_NOT_FOUND } from '../../form/GroupsElement';
import { AddGroupsForm, LABEL, labelSpecId, PLACEHOLDER } from './AddGroupsForm';
import ChangeGroupFormProps from './props';
import { mapGroupsToSearchResults, mapSearchResultsToGroups } from './helpers';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json') as Resp;
const { endpoints } = require('../../../../assets/config') as FlowEditorConfig;
const groupsResp = require('../../../../assets/groups.json') as Resp;

const { nodes: [{ actions: [, addGroupsAction] }] } = definition;
const addGroupConfig = getTypeConfig('add_contact_groups');
const removeGroupConfig = getTypeConfig('remove_contact_groups');

const context = {
    endpoints
};

const baseProps = {
    action: addGroupsAction,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    typeConfig: addGroupConfig
};

const setup = createSetup<ChangeGroupFormProps>(AddGroupsForm, baseProps, context);

const COMPONENT_TO_TEST = AddGroupsForm.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                props: { onBindWidget: onBindWidgetMock },
                // tslint:disable-next-line:no-shadowed-variable
                context: { endpoints },
                instance
            } = setup({
                onBindWidget: jest.fn()
            });
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(onBindWidgetMock).toHaveBeenCalledTimes(1);
            expect(wrapper.find('GroupsElement').props()).toEqual({
                name: 'Groups',
                placeholder: PLACEHOLDER,
                endpoint: endpoints.groups,
                groups: wrapper.state('groups'),
                add: true,
                required: true,
                onChange: instance.onGroupsChanged,
                searchPromptText: GROUP_NOT_FOUND
            });
        });
    });

    describe('instance methods', () => {
        describe('getGroups', () => {
            it("should return an empty list if action's groups are null", () => {
                const grouplessAction = { ...addGroupsAction, groups: null };
                const { wrapper, instance } = setup({ action: grouplessAction });

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it("should return an empty list if action's groups property is an empty list", () => {
                const grouplessAction = { ...addGroupsAction, groups: [] };
                const { wrapper, instance } = setup({ action: grouplessAction });

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return empty list if action is remove groups action', () => {
                const removeGroupsAction = {
                    ...addGroupsAction,
                    type: 'remove_contact_groups'
                };
                const { wrapper, instance } = setup({ action: removeGroupsAction }, true);

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return SearchResult[] if action is add groups action and it has groups', () => {
                const { wrapper, instance, props: { action: { groups } } } = setup({}, true);
                const searchResults = mapGroupsToSearchResults(groups);

                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual(searchResults);
                expect(returnedGroups).toMatchSnapshot();
            });
        });

        describe('onGroupsChanged', () => {
            it('should update state if called with new groups', () => {
                const setStateSpy = jest.spyOn(AddGroupsForm.prototype, 'setState');
                const { wrapper, instance, props: { action: { groups } } } = setup({}, true);
                const newSearchResults = mapGroupsToSearchResults(groupsResp.results as Group[]);

                instance.onGroupsChanged(newSearchResults);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ groups: newSearchResults });

                setStateSpy.mockRestore();
            });

            it('should not update state if called with same groups', () => {
                const setStateSpy = jest.spyOn(AddGroupsForm.prototype, 'setState');
                const { wrapper, instance, props: { action: { groups } } } = setup({}, true);
                const searchResults = mapGroupsToSearchResults(groups);

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
                } = setup({ updateAction: jest.fn() }, true);
                const expectedAction = {
                    uuid: action.uuid,
                    type: action.type,
                    groups: mapSearchResultsToGroups(wrapper.state('groups'))
                };

                instance.onValid();

                expect(updateActionMock).toHaveBeenCalledWith(expectedAction);
            });
        });
    });
});
