import { getTypeConfig } from '../../../config';
import { FlowEditorConfig, Group } from '../../../flowTypes';
import { createSetup, getSpecWrapper, Resp } from '../../../testUtils';
import { labelSpecId } from './AddGroupsForm';
import { mapGroupsToSearchResults } from './helpers';
import ChangeGroupFormProps from './props';
import {
    LABEL,
    NOT_FOUND,
    PLACEHOLDER,
    REMOVE_FROM_ALL,
    REMOVE_FROM_ALL_DESC,
    RemoveGroupsForm
} from './RemoveGroupsForm';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json') as Resp;
const { endpoints } = require('../../../../assets/config') as FlowEditorConfig;
const groupsResp = require('../../../../assets/groups.json') as Resp;

const { nodes: [{ actions: [, addGroupsAction] }] } = definition;
const removeGroupConfig = getTypeConfig('remove_contact_groups');
const removeGroupsAction = { ...addGroupsAction, type: removeGroupConfig };

const context = {
    endpoints
};

const baseProps = {
    action: removeGroupsAction,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    typeConfig: removeGroupConfig
};

const setup = createSetup<ChangeGroupFormProps>(RemoveGroupsForm, baseProps, context);

const COMPONENT_TO_TEST = RemoveGroupsForm.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const {
                wrapper,
                instance,
                props: { onBindWidget: onBindWidgetMock },
                // tslint:disable-next-line:no-shadowed-variable
                context: { endpoints }
            } = setup({
                onBindWidget: jest.fn()
            });
            const label = getSpecWrapper(wrapper, labelSpecId);

            expect(label.is('p')).toBeTruthy();
            expect(label.text()).toBe(LABEL);
            expect(onBindWidgetMock).toHaveBeenCalledTimes(2);
            expect(wrapper.find('GroupsElement').props()).toEqual({
                name: 'Groups',
                placeholder: PLACEHOLDER,
                endpoint: endpoints.groups,
                groups: wrapper.state('groups'),
                add: false,
                required: true,
                onChange: instance.onGroupsChanged,
                searchPromptText: NOT_FOUND
            });
            expect(wrapper.find('CheckboxElement').props()).toEqual({
                name: REMOVE_FROM_ALL,
                defaultValue: false,
                description: REMOVE_FROM_ALL_DESC,
                sibling: true,
                onCheck: instance.onCheck
            });
        });

        it('should render only the checkbox', () => {
            const {
                wrapper,
                instance,
                props: { onBindWidget: onBindWidgetMock, removeWidget: removeWidgetMock },
                // tslint:disable-next-line:no-shadowed-variable
                context: { endpoints }
            } = setup({
                onBindWidget: jest.fn(),
                removeWidget: jest.fn()
            });

            instance.onCheck();

            wrapper.update();

            expect(removeWidgetMock).toHaveBeenCalledTimes(1);
            expect(removeWidgetMock).toHaveBeenCalledWith('Groups');
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
                const { wrapper, instance } = setup({ action: grouplessAction });
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it("should return an empty list if action's groups property is an empty list", () => {
                const grouplessAction = { ...removeGroupsAction, groups: [] };
                const { wrapper, instance } = setup({ action: grouplessAction });
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return empty list if action is add groups action', () => {
                const { wrapper, instance, props: { action } } = setup(
                    { action: addGroupsAction },
                    true
                );
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual([]);
                expect(returnedGroups).toMatchSnapshot();
            });

            it('should return SearchResult[] if action is remove groups action and it has groups', () => {
                const { wrapper, instance, props: { action: { groups } } } = setup({}, true);
                const searchResults = mapGroupsToSearchResults(groups);
                const returnedGroups = instance.getGroups();

                expect(returnedGroups).toEqual(searchResults);
                expect(returnedGroups).toMatchSnapshot();
            });
        });

        describe('onGroupsChanged', () => {
            it('should update groups state if passed new groups', () => {
                const setStateSpy = jest.spyOn(RemoveGroupsForm.prototype, 'setState');
                const { wrapper, instance } = setup({}, true);
                const searchResults = mapGroupsToSearchResults(groupsResp.results as Group[]);

                instance.onGroupsChanged(searchResults);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ groups: searchResults });

                setStateSpy.mockRestore();
            });

            it('should not update groups state if passed same groups', () => {
                const setStateSpy = jest.spyOn(RemoveGroupsForm.prototype, 'setState');
                const { wrapper, instance, props: { action: { groups } } } = setup();
                const searchResults = mapGroupsToSearchResults(groups);

                expect(wrapper.state('groups')).toEqual(searchResults);

                instance.onGroupsChanged(searchResults);

                expect(setStateSpy).not.toHaveBeenCalled();

                setStateSpy.mockRestore();
            });
        });
    });
});
