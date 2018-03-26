import * as React from 'react';
import { mount } from 'enzyme';
import { getTypeConfig } from '../../../config';
import { LABEL, PLACEHOLDER, AddGroupsForm } from './AddGroupsForm';
import ChangeGroupsFormProps from './props';
import { transformGroups } from './RemoveGroupsForm.test';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { endpoints } = require('../../../../assets/config');
const { results: groupsResp } = require('../../../../assets/groups.json');

const { nodes: [{ actions: [, action] }] } = definition;
const addGroupConfig = getTypeConfig('add_contact_groups');
const removeGroupConfig = getTypeConfig('remove_contact_groups');
const context = {
    endpoints
};
const { groups } = action;
const groupOptions = groups.map(({ name, uuid }) => ({ name, id: uuid }));
const removeGroupsAction = { ...action, type: 'remove_contact_groups', groups };
const addGroupsAction = { ...removeGroupsAction, type: 'add_contact_groups' };
const props: Partial<ChangeGroupsFormProps> = {
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    typeConfig: addGroupConfig
};

describe('AddGroupsForm >', () => {
    describe('render >', () => {
        it('should render form label', () => {
            const wrapper = mount(
                <AddGroupsForm
                    {...{
                        ...props,
                        action: addGroupsAction
                    } as ChangeGroupsFormProps}
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
                <AddGroupsForm
                    {...{
                        ...props,
                        onBindWidget,
                        action: addGroupsAction
                    } as ChangeGroupsFormProps}
                />,
                {
                    context
                }
            );

            expect(onBindWidget).toHaveBeenCalledTimes(1);
        });

        it('should pass GroupsElement groups to add if action has groups', () => {
            const wrapper = mount(
                <AddGroupsForm
                    {...{
                        ...props,
                        action: addGroupsAction
                    } as ChangeGroupsFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('GroupsElement').props()).toEqual(
                expect.objectContaining({
                    name: 'Groups',
                    placeholder: PLACEHOLDER,
                    endpoint: endpoints.groups,
                    groups: groupOptions,
                    add: true,
                    required: true,
                    onChange: wrapper.instance().onGroupsChanged
                })
            );
        });

        it("should pass GroupsElement an empty 'groups' prop if action doesn't yet have groups", () => {
            const wrapper = mount(
                <AddGroupsForm
                    {...{
                        ...props,
                        action: { ...addGroupsAction, groups: null }
                    } as ChangeGroupsFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('GroupsElement').props()).toEqual(
                expect.objectContaining({
                    name: 'Groups',
                    placeholder: PLACEHOLDER,
                    endpoint: endpoints.groups,
                    groups: [],
                    add: true,
                    required: true,
                    onChange: wrapper.instance().onGroupsChanged
                })
            );
        });

        it("should pass GroupsElement an empty 'groups' prop if action is of type 'remove_contact_groups", () => {
            const wrapper = mount(
                <AddGroupsForm
                    {...{
                        ...props,
                        action: removeGroupsAction
                    } as ChangeGroupsFormProps}
                />,
                {
                    context
                }
            );

            expect(wrapper.find('GroupsElement').props()).toEqual(
                expect.objectContaining({
                    name: 'Groups',
                    placeholder: PLACEHOLDER,
                    endpoint: endpoints.groups,
                    groups: [],
                    add: true,
                    required: true,
                    onChange: wrapper.instance().onGroupsChanged
                })
            );
        });
    });

    describe('instance methods >', () => {
        describe('onGroupsChanged >', () => {
            it('should only update state if groups param !== groups in state', () => {
                const setStateSpy = jest.spyOn(AddGroupsForm.prototype, 'setState');
                const groupsChangedSpy = jest.spyOn(AddGroupsForm.prototype, 'onGroupsChanged');

                const wrapper = mount(
                    <AddGroupsForm
                        {...{
                            ...props,
                            action: addGroupsAction
                        } as ChangeGroupsFormProps}
                    />,
                    {
                        context
                    }
                );

                const oldGroups = transformGroups(addGroupsAction.groups);
                const newGroups = transformGroups(groupsResp.slice(2));

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
                const onValidSpy = jest.spyOn(AddGroupsForm.prototype, 'onValid');
                const updateActionMock: jest.Mock<{}> = jest.fn();

                const wrapper = mount(
                    <AddGroupsForm
                        {...{
                            ...props,
                            updateAction: updateActionMock,
                            action: addGroupsAction
                        } as ChangeGroupsFormProps}
                    />,
                    {
                        context
                    }
                );

                wrapper.instance().onValid();

                expect(onValidSpy).toHaveBeenCalledTimes(1);
                expect(updateActionMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'add_contact_groups',
                        groups: addGroupsAction.groups
                    })
                );

                onValidSpy.mockRestore();
            });
        });

        describe('getGroups >', () => {
            it('should return an empty array if action exists but does not yet have groups', () => {
                const wrapper = mount(
                    <AddGroupsForm
                        {...{
                            ...props,
                            action: { ...addGroupsAction, groups: null }
                        } as ChangeGroupsFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it("should return an empty list if action exists at node but isn't a add to groups action", () => {
                const wrapper = mount(
                    <AddGroupsForm
                        {...{
                            ...props,
                            action: removeGroupsAction
                        } as ChangeGroupsFormProps}
                    />,
                    {
                        context
                    }
                );

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it('should return SearchResults array if add to groups action exists at node', () => {
                const wrapper = mount(
                    <AddGroupsForm
                        {...{
                            ...props,
                            action: addGroupsAction
                        } as ChangeGroupsFormProps}
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
