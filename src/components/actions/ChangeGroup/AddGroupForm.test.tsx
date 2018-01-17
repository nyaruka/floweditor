import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import ChangeGroupFormProps from './groupFormPropTypes';
import Config from '../../../providers/ConfigProvider/configContext';
import AddGroupForm, { LABEL, NOT_FOUND, PLACEHOLDER } from './AddGroupForm';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import { ChangeGroup } from '../../../flowTypes';
import { transformGroups } from './RemoveGroupForm.test';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const { results: groupsResp } = require('../../../../assets/groups.json');

const CompMap = new ComponentMap(definition);

const { nodes: [{ actions: [, action] }] } = definition;
const addGroupConfig: Type = Config.getTypeConfig('add_to_group');
const removeGroupConfig: Type = Config.getTypeConfig('remove_from_group');
const { endpoints } = Config;
const context = {
    endpoints
};
const { groups }: ChangeGroup = action;
const groupOptions: SearchResult[] = groups.map(({ name, uuid }) => ({ name, id: uuid }));
const removeGroupsAction: ChangeGroup = { ...action, type: 'remove_from_group', groups };
const addGroupsAction: ChangeGroup = { ...removeGroupsAction, type: 'add_to_group' };
const localGroups = CompMap.getGroups();
const props: Partial<ChangeGroupFormProps> = {
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    ComponentMap: CompMap,
    config: addGroupConfig
};

describe('AddGroupForm >', () => {
    describe('render >', () => {
        it("should call component map prop's 'getGroups' method", () => {
            const getGroupsMock: jest.Mock<{}> = jest.fn();

            const ComponentMapMock: {
                getGroups: jest.Mock<{}>;
            } = {
                getGroups: getGroupsMock
            };

            const wrapper: ReactWrapper = mount(
                <AddGroupForm
                    {...{
                        ...props,
                        ComponentMap: ComponentMapMock,
                        action: addGroupsAction
                    } as any}
                />,
                {
                    context
                }
            );

            expect(getGroupsMock).toHaveBeenCalledTimes(1);
        });

        it('should render form label', () => {
            const wrapper: ReactWrapper = mount(
                <AddGroupForm
                    {...{
                        ...props,
                        action: addGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('div').exists()).toBeTruthy();
            expect(wrapper.find('p').text()).toBe(LABEL);
        });

        it("should call 'onBindWidget' once", () => {
            const onBindWidget: jest.Mock<{}> = jest.fn();

            const wrapper: ReactWrapper = mount(
                <AddGroupForm
                    {...{
                        ...props,
                        onBindWidget,
                        action: addGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(onBindWidget).toHaveBeenCalledTimes(1);
        });

        it('should pass GroupElement groups to add if action has groups', () => {
            const wrapper: ReactWrapper = mount(
                <AddGroupForm
                    {...{
                        ...props,
                        action: addGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('GroupElement').props()).toEqual({
                name: 'Group',
                placeholder: PLACEHOLDER,
                endpoint: endpoints.groups,
                groups: groupOptions,
                localGroups,
                add: true,
                required: true,
                searchPromptText: NOT_FOUND,
                onChange: wrapper.instance().onGroupsChanged
            });
        });

        it("should pass GroupElement an empty 'groups' prop if action doesn't yet have groups", () => {
            const wrapper: ReactWrapper = mount(
                <AddGroupForm
                    {...{
                        ...props,
                        action: { ...addGroupsAction, groups: null }
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('GroupElement').props()).toEqual({
                name: 'Group',
                placeholder: PLACEHOLDER,
                endpoint: endpoints.groups,
                groups: [],
                localGroups,
                add: true,
                required: true,
                searchPromptText: NOT_FOUND,
                onChange: wrapper.instance().onGroupsChanged
            });
        });

        it("should pass GroupElement an empty 'groups' prop if action is of type 'remove_from_group", () => {
            const wrapper: ReactWrapper = mount(
                <AddGroupForm
                    {...{
                        ...props,
                        action: removeGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('GroupElement').props()).toEqual({
                name: 'Group',
                placeholder: PLACEHOLDER,
                endpoint: endpoints.groups,
                groups: [],
                localGroups,
                add: true,
                required: true,
                searchPromptText: NOT_FOUND,
                onChange: wrapper.instance().onGroupsChanged
            });
        });
    });

    describe('instance methods >', () => {
        describe('onGroupsChanged >', () => {
            it('should only update state if groups param !== groups in state', () => {
                const setStateSpy = jest.spyOn(AddGroupForm.prototype, 'setState');
                const groupsChangedSpy = jest.spyOn(AddGroupForm.prototype, 'onGroupsChanged');

                const wrapper: ReactWrapper = mount(
                    <AddGroupForm
                        {...{
                            ...props,
                            action: addGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                const oldGroups: SearchResult[] = transformGroups(addGroupsAction.groups);
                const newGroups: SearchResult[] = transformGroups(groupsResp.slice(2));

                expect(wrapper.state('groups')).toEqual(oldGroups);

                wrapper.instance().onGroupsChanged(oldGroups);

                expect(groupsChangedSpy).toHaveBeenCalled();
                expect(setStateSpy).not.toHaveBeenCalled();

                wrapper.instance().onGroupsChanged(newGroups);

                expect(groupsChangedSpy).toHaveBeenCalledTimes(2);
                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(wrapper.state('groups')).toEqual(newGroups);

                setStateSpy.mockRestore();
                groupsChangedSpy.mockRestore();
            });
        });

        describe('onValid >', () => {
            it("should create a add to groups action, pass it to 'updateAction' prop", () => {
                const onValidSpy = jest.spyOn(AddGroupForm.prototype, 'onValid');
                const updateActionMock: jest.Mock<{}> = jest.fn();

                const wrapper: ReactWrapper = mount(
                    <AddGroupForm
                        {...{
                            ...props,
                            updateAction: updateActionMock,
                            action: addGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                wrapper.instance().onValid();

                expect(onValidSpy).toHaveBeenCalledTimes(1);
                expect(updateActionMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'add_to_group',
                        groups: addGroupsAction.groups
                    })
                );

                onValidSpy.mockRestore();
            });
        });

        describe('getGroups >', () => {
            it('should return an empty array if action exists but does not yet have groups', () => {
                const wrapper: ReactWrapper = mount(
                    <AddGroupForm
                        {...{
                            ...props,
                            action: { ...addGroupsAction, groups: null }
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it("should return an empty list if action exists at node but isn't a add to groups action", () => {
                const wrapper: ReactWrapper = mount(
                    <AddGroupForm
                        {...{
                            ...props,
                            action: removeGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it('should return SearchResults array if add to groups action exists at node', () => {
                const wrapper: ReactWrapper = mount(
                    <AddGroupForm
                        {...{
                            ...props,
                            action: addGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual(
                    transformGroups(addGroupsAction.groups)
                );
            });
        });
    });
});
