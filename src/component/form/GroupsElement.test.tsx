import * as React from 'react';
import { FlowEditorConfig, ResultType } from '../../flowTypes';
import { createSetup, Resp } from '../../testUtils';
import { validUUID } from '../../utils';
import SelectSearch from '../SelectSearch';
import GroupsElement, {
    createNewOption,
    getInitialGroups,
    GROUP_NOT_FOUND,
    GROUP_PLACEHOLDER,
    GroupsElementProps,
    isValidNewOption,
    GROUP_PROMPT
} from './GroupsElement';

const { results: groupsResp } = require('../../../assets/groups.json') as Resp;
const config = require('../../../assets/config') as FlowEditorConfig;

const baseProps = {
    name: 'Groups',
    endpoint: config.endpoints.groups,
    placeholder: GROUP_PLACEHOLDER,
    searchPromptText: GROUP_NOT_FOUND
};

const setup = createSetup<GroupsElementProps>(baseProps, null, GroupsElement);

const getGroupOptions = () =>
    groupsResp.map(({ name, uuid }) => ({
        name,
        id: uuid
    }));

const getGroups = (sliceAt: number) =>
    groupsResp
        .map(({ name, uuid }) => ({
            name,
            id: uuid
        }))
        .slice(sliceAt);

const COMPONENT_TO_TEST = GroupsElement.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('helpers', () => {
        describe('isValidNewOption', () => {
            it('should return false if new option is invalid', () => {
                expect(isValidNewOption({ label: '$$$' })).toBeFalsy();
            });

            it('should return true if new option is valid', () => {
                const newGroup = { label: 'new group' };
                expect(isValidNewOption(newGroup)).toBeTruthy();
            });
        });

        describe('createNewOption', () => {
            it('should generate a new search result object', () => {
                const newGroup = { label: 'new group' };
                const newOption = createNewOption(newGroup);
                expect(validUUID(newOption.id)).toBeTruthy();
                expect(newOption.name).toBe(newGroup.label);
                expect(newOption.extraResult).toBeTruthy();
            });
        });

        describe('getInitialGroups', () => {
            it("should return an empty array if passed a falsy 'groups' prop", () => {
                expect(getInitialGroups({} as GroupsElementProps)).toEqual([]);
            });

            it("should return an array of SearchResult objects if passed a truthy 'groups' prop", () => {
                const groupOptions = getGroupOptions();

                expect(
                    getInitialGroups({
                        groups: groupOptions
                    } as GroupsElementProps)
                ).toEqual(groupOptions);
            });

            it(`should return localGroups array if ${COMPONENT_TO_TEST} passed 'localGroups' prop but not 'groups' prop`, () => {
                const groupOptions = getGroupOptions();

                expect(
                    getInitialGroups({
                        localGroups: groupOptions
                    } as GroupsElementProps)
                ).toEqual(groupOptions);
            });
        });
    });

    describe('render', () => {
        it('should render self, children with required props', () => {
            const { wrapper, props: { name, endpoint } } = setup();
            const GroupsElementInstance = wrapper.instance();
            const formElement = wrapper.find('FormElement');

            expect(formElement.prop('name')).toBe(name);
            expect(formElement.prop('errors')).toEqual([]);
            expect(wrapper.find('SelectSearch').props()).toEqual({
                _className: '',
                onChange: GroupsElementInstance.onChange,
                localSearchOptions: undefined,
                name,
                url: endpoint,
                resultType: ResultType.group,
                multi: true,
                initial: [],
                placeholder: GROUP_PLACEHOLDER,
                searchPromptText: GROUP_NOT_FOUND
            });
        });

        it("should pass createOptions object if it's add prop is true", () => {
            const { wrapper } = setup({ add: true });
            const selectSearch = wrapper.find('SelectSearch');

            expect(selectSearch.prop('isValidNewOption')).toEqual(expect.any(Function));
            expect(selectSearch.prop('createNewOption')).toEqual(expect.any(Function));
            expect(selectSearch.prop('createPrompt')).toBe(GROUP_PROMPT);
        });
    });

    describe('instance methods', () => {
        describe('componentWillReceiveProps', () => {
            it(`should be called when ${COMPONENT_TO_TEST} receives new props`, () => {
                const componentWillReceivePropsSpy = jest.spyOn(
                    GroupsElement.prototype,
                    'componentWillReceiveProps'
                );
                const { wrapper } = setup();
                const nextProps = { ...baseProps, add: true };

                wrapper.setProps(nextProps);

                expect(componentWillReceivePropsSpy).toHaveBeenCalledTimes(1);
                expect(componentWillReceivePropsSpy).toHaveBeenCalledWith(nextProps, {});

                componentWillReceivePropsSpy.mockRestore();
            });

            it(`should call ${COMPONENT_TO_TEST}.prototype.setState if ${COMPONENT_TO_TEST} receives new groups through props`, () => {
                const setStateSpy = jest.spyOn(GroupsElement.prototype, 'setState');
                const groups = getGroups(2);
                const { wrapper } = setup({ groups });
                const newGroups = getGroups(3);
                const nextProps = { ...baseProps, groups: newGroups };

                wrapper.setProps(nextProps);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({
                    groups: newGroups
                });

                setStateSpy.mockRestore();
            });
        });

        describe('onChange', () => {
            it('should update state when called', () => {
                const setStateSpy = jest.spyOn(GroupsElement.prototype, 'setState');
                const groups = getGroups(3);
                const { wrapper, props: { onChange } } = setup();
                const GroupsElementInstance = wrapper.instance();

                GroupsElementInstance.onChange(groups);

                expect(setStateSpy).toHaveBeenCalledWith({ groups }, expect.any(Function));
            });

            it("should call 'onChange' prop if passed", () => {
                const groups = getGroups(3);
                const onChangeMock = jest.fn();
                const { wrapper } = setup({ onChange: onChangeMock });
                const GroupsElementInstance = wrapper.instance();

                GroupsElementInstance.onChange(groups);

                expect(onChangeMock).toHaveBeenCalledTimes(1);
                expect(onChangeMock).toHaveBeenCalledWith(groups);
            });
        });

        describe('validate', () => {
            it(`should return false, update errors state if ${COMPONENT_TO_TEST} isn't valid`, () => {
                const { wrapper, props: { name } } = setup({ required: true });
                const GroupsElementInstance = wrapper.instance();

                expect(GroupsElementInstance.validate()).toBeFalsy();
                expect(wrapper.state('errors')[0]).toBe(`${name} is required.`);
            });

            it(`should return true if ${COMPONENT_TO_TEST} is valid`, () => {
                const groups = getGroups(2);
                const { wrapper, props: { name } } = setup({ required: true });
                const GroupsElementInstance = wrapper.instance();

                expect(GroupsElementInstance.onChange(groups));
                expect(GroupsElementInstance.validate()).toBeTruthy();
            });
        });
    });
});
