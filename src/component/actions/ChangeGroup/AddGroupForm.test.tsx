import * as React from 'react';
import { mount } from 'enzyme';
import ComponentMap from '../../../services/ComponentMap';
import ChangeGroupFormProps from './props';
import AddGroupForm, { LABEL, PLACEHOLDER } from './AddGroupForm';
import { transformGroups } from './RemoveGroupForm.test';
import { getTypeConfig } from '../../../config';

const {
    results: [{ definition }]
} = require('../../../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { endpoints } = require('../../../../assets/config');
const { results: groupsResp } = require('../../../../assets/groups.json');

const CompMap = new ComponentMap(definition);

const { nodes: [{ actions: [, action] }] } = definition;
const addGroupConfig = getTypeConfig('add_to_group');
const removeGroupConfig = getTypeConfig('remove_from_group');
const context = {
    endpoints
};
const { groups } = action;
const groupOptions = groups.map(({ name, uuid }) => ({ name, id: uuid }));
const removeGroupsAction = { ...action, type: 'remove_from_group', groups };
const addGroupsAction = { ...removeGroupsAction, type: 'add_to_group' };
const props: Partial<ChangeGroupFormProps> = {
    updateAction: jest.fn(),
    onBindWidget: jest.fn(),
    removeWidget: jest.fn(),
    ComponentMap: CompMap,
    config: addGroupConfig
};

describe('AddGroupForm >', () => {
    describe('render >', () => {
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
                    onChange: wrapper.instance().onGroupsChanged
                })
            );
        });
    });

    describe('instance methods >', () => {
        describe('onGroupsChanged >', () => {
            it('should only update state if groups param !== groups in state', () => {
                const setStateSpy = jest.spyOn(AddGroupForm.prototype, 'setState');
                const groupsChangedSpy = jest.spyOn(AddGroupForm.prototype, 'onGroupsChanged');

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
                const onValidSpy = jest.spyOn(AddGroupForm.prototype, 'onValid');
                const updateActionMock: jest.Mock<{}> = jest.fn();

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

        describe('getGroups >', () => {
            it('should return an empty array if action exists but does not yet have groups', () => {
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

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it("should return an empty list if action exists at node but isn't a add to groups action", () => {
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

                expect(wrapper.instance().getGroups()).toEqual([]);
            });

            it('should return SearchResults array if add to groups action exists at node', () => {
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

                expect(wrapper.instance().getGroups()).toEqual(
                    transformGroups(addGroupsAction.groups)
                );
            });
        });
    });
});
