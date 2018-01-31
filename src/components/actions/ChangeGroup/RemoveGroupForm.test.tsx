import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import ChangeGroupFormProps from './groupFormPropTypes';
import Config from '../../../providers/ConfigProvider/configContext';
import RemoveGroupForm, {
    LABEL,
    NOT_FOUND,
    PLACEHOLDER,
    REMOVE_FROM_ALL,
    REMOVE_FROM_ALL_DESC
} from './RemoveGroupForm';
import { getSpecWrapper } from '../../../helpers/utils';
import { ChangeGroup, Group } from '../../../flowTypes';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';

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
const removeAllGroupsAction: ChangeGroup = { ...removeGroupsAction, groups: [] };
const addGroupSAction: ChangeGroup = { ...removeGroupsAction, type: 'add_to_group' };
const localGroups = CompMap.getGroups();
const props: Partial<ChangeGroupFormProps> = {
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    ComponentMap: CompMap,
    config: removeGroupConfig
};

export const transformGroups = (grps: Group[]): SearchResult[] =>
    grps.map(({ name, uuid }) => ({ name, id: uuid }));

describe('RemoveGroupForm >', () => {
    describe('render >', () => {
        it('should render form label', () => {
            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        action: removeGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('div').exists()).toBeTruthy();
            expect(wrapper.find('p').text()).toBe(LABEL);
        });

        it("should call 'onBindWidget' twice if existing action isn't removing all groups", () => {
            const onBindWidget: jest.Mock<{}> = jest.fn();

            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        onBindWidget,
                        action: removeGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(onBindWidget).toHaveBeenCalledTimes(2);
        });

        it("should call 'onBindWidget' once if existing action is removing all groups", () => {
            const onBindWidget: jest.Mock<{}> = jest.fn();

            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        onBindWidget,
                        action: removeAllGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(onBindWidget).toHaveBeenCalledTimes(1);
        });

        it('should pass GroupElement groups to remove if action has groups', () => {
            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
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
                groups: groupOptions,
                localGroups,
                add: false,
                required: true,
                searchPromptText: NOT_FOUND,
                onChange: wrapper.instance().onGroupsChanged
            });
        });

        it("should pass GroupElement an empty 'groups' prop if action doesn't have groups", () => {
            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        action: { ...removeGroupsAction, groups: null }
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
                add: false,
                required: true,
                searchPromptText: NOT_FOUND,
                onChange: wrapper.instance().onGroupsChanged
            });
        });

        it("should pass GroupElement an empty 'groups' prop if action is of type 'add_to_group'", () => {
            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        action: { ...removeGroupsAction, type: 'add_to_group' }
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
                add: false,
                required: true,
                searchPromptText: NOT_FOUND,
                onChange: wrapper.instance().onGroupsChanged
            });
        });

        it("should render only 'Remove from Group' checkbox element if passed a remove from all groups action", () => {
            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        action: removeAllGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('GroupElement').exists()).toBeFalsy();

            expect(wrapper.find('CheckboxElement').props()).toEqual({
                name: REMOVE_FROM_ALL,
                defaultValue: true,
                description: REMOVE_FROM_ALL_DESC,
                sibling: false,
                onCheck: wrapper.instance().onCheck
            });
        });

        it("should render only the 'Remove from Group' checkbox element when it's checked", () => {
            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        action: removeGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            wrapper
                .find('CheckboxElement')
                .find('input')
                .simulate('change');

            expect(wrapper.state('removeFromAll')).toBeTruthy();
            expect(getSpecWrapper(wrapper, 'field-container').children()).toHaveLength(1);
            expect(wrapper.find('CheckboxElement').exists()).toBeTruthy();
        });

        it('should keep groups in state, render GroupElement if CheckBoxElement checked and then unchecked', () => {
            const wrapper: ReactWrapper = mount(
                <RemoveGroupForm
                    {...{
                        ...props,
                        action: removeGroupsAction
                    } as ChangeGroupFormProps}
                />,
                {
                    context
                }
            );

            const searchResults: SearchResult[] = transformGroups(removeGroupsAction.groups);

            expect(wrapper.find('GroupElement').prop('groups')).toEqual(searchResults);

            wrapper
                .find('CheckboxElement')
                .find('input')
                .simulate('change');

            expect(wrapper.state('removeFromAll')).toBeTruthy();
            expect(wrapper.find('GroupElement').exists()).toBeFalsy();
            expect(wrapper.find('CheckboxElement').exists()).toBeTruthy();

            wrapper
                .find('CheckboxElement')
                .find('input')
                .simulate('change');

            expect(wrapper.state('removeFromAll')).toBeFalsy();
            expect(wrapper.find('GroupElement').prop('groups')).toEqual(searchResults);
            expect(wrapper.find('CheckboxElement').exists()).toBeTruthy();
        });
    });

    describe('instance methods >', () => {
        describe('onGroupsChanged >', () => {
            it('should only update state if groups param !== groups in state', () => {
                const setStateSpy = jest.spyOn(RemoveGroupForm.prototype, 'setState');
                const groupsChangedSpy = jest.spyOn(RemoveGroupForm.prototype, 'onGroupsChanged');

                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            action: removeGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                const oldGroups: SearchResult[] = transformGroups(removeGroupsAction.groups);
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

        describe('onCheck >', () => {
            it('should update state when called', () => {
                const setStateSpy = jest.spyOn(RemoveGroupForm.prototype, 'setState');
                const onCheckSpy = jest.spyOn(RemoveGroupForm.prototype, 'onCheck');

                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            action: removeAllGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.state('removeFromAll')).toBeTruthy();

                wrapper.instance().onCheck();

                expect(onCheckSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(wrapper.state('removeFromAll')).toBeFalsy();

                wrapper.instance().onCheck();

                expect(onCheckSpy).toHaveBeenCalledTimes(2);
                expect(setStateSpy).toHaveBeenCalledTimes(2);
                expect(wrapper.state('removeFromAll')).toBeTruthy();

                setStateSpy.mockRestore();
                onCheckSpy.mockRestore();
            });
        });

        describe('onValid >', () => {
            it("should create a remove from groups action, pass it to 'updateAction' prop", () => {
                const onValidSpy = jest.spyOn(RemoveGroupForm.prototype, 'onValid');
                const updateActionMock: jest.Mock<{}> = jest.fn();

                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            updateAction: updateActionMock,
                            action: removeGroupsAction
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
                        type: 'remove_from_group',
                        groups: removeGroupsAction.groups
                    })
                );

                onValidSpy.mockRestore();
            });

            it("should create a remove from all groups action, pass it to 'updateAction' prop", () => {
                const onValidSpy = jest.spyOn(RemoveGroupForm.prototype, 'onValid');
                const updateActionMock: jest.Mock<{}> = jest.fn();

                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            updateAction: updateActionMock,
                            action: removeAllGroupsAction
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
                        type: 'remove_from_group',
                        groups: removeAllGroupsAction.groups
                    })
                );

                onValidSpy.mockRestore();
            });
        });

        describe('getGroups >', () => {
            it('should return an empty array if action exists but does not yet have groups', () => {
                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            action: { ...removeGroupsAction, groups: null }
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it("should return an empty list if action exists at node but isn't a remove from group action", () => {
                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            action: addGroupSAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it('should return SearchResults array if remove from groups action exists at node', () => {
                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            action: removeGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual(
                    transformGroups(removeGroupsAction.groups)
                );
            });
        });

        describe('getFields >', () => {
            it("should call component map prop's 'getGroups' method", () => {
                const getGroupsMock: jest.Mock<{}> = jest.fn();

                const ComponentMapMock: {
                    getGroups: jest.Mock<{}>;
                } = {
                    getGroups: getGroupsMock
                };

                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            ComponentMap: ComponentMapMock,
                            action: removeGroupsAction
                        } as any}
                    />,
                    {
                        context
                    }
                );

                expect(getGroupsMock).toHaveBeenCalledTimes(1);
            });

            it("it should call 'removeWidget' prop on 'Group' widget if its 'removeFromAll' state is falsy", () => {
                const removeWidgetMock: jest.Mock<{}> = jest.fn();

                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            removeWidget: removeWidgetMock,
                            action: removeAllGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(removeWidgetMock).toHaveBeenCalledTimes(1);
                expect(removeWidgetMock).toHaveBeenLastCalledWith('Group');
            });

            it("it should not call 'removeWidget' prop if its 'removeFromAll' state is truthy", () => {
                const removeWidgetMock: jest.Mock<{}> = jest.fn();

                const wrapper: ReactWrapper = mount(
                    <RemoveGroupForm
                        {...{
                            ...props,
                            removeWidget: removeWidgetMock,
                            action: removeGroupsAction
                        } as ChangeGroupFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(removeWidgetMock).not.toHaveBeenCalled();
            });
        });
    });
});
