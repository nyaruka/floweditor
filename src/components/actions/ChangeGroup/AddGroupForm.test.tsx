import * as React from 'react';
import { mount } from 'enzyme';
import { substArr } from '@ycleptkellan/substantive';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import ChangeGroupFormProps from './groupFormPropTypes';
import Config from '../../../providers/ConfigProvider/configContext';
import AddGroupForm, {
    LABEL,
    NOT_FOUND,
    PLACEHOLDER,
    getGroupsState,
    getLocalGroups,
    transformGroups
} from './AddGroupForm';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import { ChangeGroup, Group } from '../../../flowTypes';

const {
    results: [{ definition }]
} = require('../../../../test_flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');

const { results: groupsResp } = require('../../../../assets/groups.json');

const CompMap = new ComponentMap(definition);

const { nodes: [node] } = definition;
const { actions: [, action] } = node;
const addGroupConfig: Type = Config.getTypeConfig('add_to_group');
const removeGroupConfig: Type = Config.getTypeConfig('remove_from_group');
const { endpoints } = Config;
const context = {
    endpoints
};
const { groups }: ChangeGroup = action;
const groupOptions: SearchResult[] = groups.map(({ name, uuid }) => ({
    name,
    id: uuid
}));
const removeGroupsAction: ChangeGroup = {
    ...action,
    type: 'remove_from_group',
    groups
};
const addGroupsAction: ChangeGroup = {
    ...removeGroupsAction,
    type: 'add_to_group'
};

const props: Partial<ChangeGroupFormProps> = {
    node,
    action,
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    ComponentMap: CompMap,
    config: addGroupConfig
};

describe('AddGroupForm >', () => {
    describe('helpers >', () => {
        const groupAction = {
            uuid: 'b179219a-9283-4284-9de9-91925988643d',
            type: 'add_to_group'
        };

        describe('getGroupState >', () => {
            it("should return an empty array if the existing ChangeGroup action doesn't have groups", () => {
                expect(
                    getGroupsState({
                        ...props,
                        action: groupAction
                    } as ChangeGroupFormProps)
                ).toEqual([]);

                expect(
                    getGroupsState({
                        ...props,
                        action: {
                            ...groupAction,
                            groups: []
                        }
                    } as ChangeGroupFormProps)
                ).toEqual([]);

                expect(
                    getGroupsState({
                        ...props,
                        action: {
                            ...groupAction,
                            groups: null
                        }
                    } as ChangeGroupFormProps)
                ).toEqual([]);
            });

            it("should return an empty array if type of ChangeGroup action existing at node doesn't match the group form's type", () => {
                expect(
                    getGroupsState({
                        ...props,
                        action: groupAction
                    } as ChangeGroupFormProps)
                ).toEqual([]);

                expect(
                    getGroupsState(
                        {
                            ...props,
                            action: {
                                ...groupAction,
                                type: 'remove_from_group'
                            }
                        } as ChangeGroupFormProps,
                        true
                    )
                ).toEqual([]);
            });

            it('should return a list of groups as SearchResult[] if existing action has groups', () => {
                getGroupsState(props as ChangeGroupFormProps, true).forEach(
                    group => {
                        expect(group.name).toBeTruthy();
                        expect(group.id).toBeTruthy();
                    }
                );

                getGroupsState({
                    ...props,
                    action: {
                        ...groupAction,
                        type: 'remove_from_group',
                        groups
                    }
                } as ChangeGroupFormProps).forEach(group => {
                    expect(group.name).toBeTruthy();
                    expect(group.id).toBeTruthy();
                });
            });
        });

        describe('getLocalGroups >', () => {
            it('should return an empty array if ChangeGroup action exists at node and its type matches that of the group form', () => {
                expect(getLocalGroups(props as ChangeGroupFormProps)).toEqual(
                    []
                );

                expect(
                    getLocalGroups(
                        {
                            ...props,
                            node: {
                                ...node,
                                actions: [
                                    node.actions[0],
                                    {
                                        ...node.actions[1],
                                        type: 'remove_from_group'
                                    }
                                ]
                            }
                        } as ChangeGroupFormProps,
                        true
                    )
                ).toEqual([]);
            });

            it('should return local groups if node does not contain actions', () => {
                const getGroupsSpy = jest.spyOn(CompMap, 'getGroups');

                expect(
                    substArr(
                        getLocalGroups({
                            ...props,
                            node: { ...node, actions: [] }
                        } as ChangeGroupFormProps)
                    )
                ).toBeTruthy();
                expect(getGroupsSpy).toHaveBeenCalled();

                getGroupsSpy.mockRestore();
            });
        });

        describe('transformGroups >', () => {
            it('should transform groups into search results', () => {
                transformGroups(groups).forEach(group => {
                    expect(group.name).toBe(
                        groups.filter(({ uuid }) => uuid === group.id)[0].name
                    );
                    expect(group.id).toBe(
                        groups.filter(({ uuid }) => uuid === group.id)[0].uuid
                    );
                });
            });
        });
    });

    describe('render >', () => {
        it("should call component map prop's 'getGroups' method", () => {
            const getGroupsMock: jest.Mock<{}> = jest.fn();

            const ComponentMapMock: {
                getGroups: jest.Mock<{}>;
            } = {
                getGroups: getGroupsMock
            };

            const wrapper = mount(
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
            const wrapper = mount(
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

            const wrapper = mount(
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
            const wrapper = mount(
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

            expect(wrapper.find('GroupElement').props()).toEqual(
                expect.objectContaining({
                    name: 'Group',
                    placeholder: PLACEHOLDER,
                    endpoint: endpoints.groups,
                    groups: groupOptions,
                    add: true,
                    required: true,
                    searchPromptText: NOT_FOUND,
                    onChange: wrapper.instance().onGroupsChanged
                })
            );
        });

        it("should pass GroupElement an empty 'groups' prop if action doesn't yet have groups", () => {
            const wrapper = mount(
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

            expect(wrapper.find('GroupElement').props()).toEqual(
                expect.objectContaining({
                    name: 'Group',
                    placeholder: PLACEHOLDER,
                    endpoint: endpoints.groups,
                    groups: [],
                    add: true,
                    required: true,
                    searchPromptText: NOT_FOUND,
                    onChange: wrapper.instance().onGroupsChanged
                })
            );
        });

        it("should pass GroupElement an empty 'groups' prop if action is of type 'remove_from_group", () => {
            const wrapper = mount(
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

            expect(wrapper.find('GroupElement').props()).toEqual(
                expect.objectContaining({
                    name: 'Group',
                    placeholder: PLACEHOLDER,
                    endpoint: endpoints.groups,
                    groups: [],
                    add: true,
                    required: true,
                    searchPromptText: NOT_FOUND,
                    onChange: wrapper.instance().onGroupsChanged
                })
            );
        });
    });

    describe('instance methods >', () => {
        describe('onGroupsChanged >', () => {
            it('should only update state if groups param !== groups in state', () => {
                const setStateSpy = jest.spyOn(
                    AddGroupForm.prototype,
                    'setState'
                );
                const groupsChangedSpy = jest.spyOn(
                    AddGroupForm.prototype,
                    'onGroupsChanged'
                );

                const wrapper = mount(
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

                const oldGroups: SearchResult[] = transformGroups(
                    addGroupsAction.groups
                );
                const newGroups: SearchResult[] = transformGroups(
                    groupsResp.slice(2)
                );

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
                const onValidSpy = jest.spyOn(
                    AddGroupForm.prototype,
                    'onValid'
                );

                const updateActionMock = jest.fn();

                const wrapper = mount(
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
    });
});
