import { ResultType } from '../../flowTypes';
import { composeComponentTestUtils, configProviderContext, setMock } from '../../testUtils';
import { createSelectOption, getGroupOptions, getGroups } from '../../testUtils/assetCreators';
import { set, setTrue, validUUID } from '../../utils';
import GroupsElement, {
    createNewOption,
    getInitialGroups,
    GROUP_NOT_FOUND,
    GROUP_PLACEHOLDER,
    GROUP_PROMPT,
    GroupsElementProps,
    isValidNewOption
} from './GroupsElement';

const baseProps: GroupsElementProps = {
    name: 'Groups',
    endpoint: configProviderContext.endpoints.groups,
    placeholder: GROUP_PLACEHOLDER,
    searchPromptText: GROUP_NOT_FOUND
};

const { setup, spyOn } = composeComponentTestUtils(GroupsElement, baseProps);

describe(GroupsElement.name, () => {
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
                const newGroup = createSelectOption({ label: 'Friends' });
                const newOption = createNewOption(newGroup);

                expect(validUUID(newOption.id)).toBeTruthy();
                expect(newOption.name).toBe(newGroup.label);
                expect(newOption.extraResult).toBeTruthy();
            });
        });

        describe('getInitialGroups', () => {
            it("should return an empty list if passed a falsy 'groups' prop", () => {
                const initialGroups = getInitialGroups();

                expect(initialGroups).toEqual([]);
                expect(initialGroups).toMatchSnapshot();
            });

            it("should return a list of SearchResult objects if passed a truthy 'groups' prop", () => {
                const expectedOptions = getGroupOptions();
                const initialGroups = getInitialGroups(expectedOptions);

                expect(initialGroups).toEqual(expectedOptions);
                expect(initialGroups).toMatchSnapshot();
            });

            it("should return localGroups list if passed 'localGroups' prop but not 'groups' prop", () => {
                const groupOptions = getGroupOptions();

                expect(getInitialGroups(undefined, groupOptions)).toEqual(groupOptions);
                expect(groupOptions).toMatchSnapshot();
            });
        });
    });

    describe('render', () => {
        it('should render self, children with required props', () => {
            const { wrapper, instance, props } = setup();
            const formElement = wrapper.find('FormElement');

            expect(formElement.prop('name')).toBe(props.name);
            expect(formElement.prop('errors')).toEqual([]);
            expect(wrapper.find('SelectSearch').props()).toEqual({
                _className: '',
                onChange: instance.onChange,
                localSearchOptions: undefined,
                name: props.name,
                url: props.endpoint,
                resultType: ResultType.group,
                multi: true,
                initial: [],
                placeholder: GROUP_PLACEHOLDER,
                searchPromptText: GROUP_NOT_FOUND
            });
            expect(wrapper).toMatchSnapshot();
        });

        it("should pass createOptions object if it's add prop is true", () => {
            const { wrapper, instance } = setup(true, { add: setTrue() });
            const selectSearch = wrapper.find('SelectSearch');

            expect(selectSearch.prop('isValidNewOption')).toEqual(expect.any(Function));
            expect(selectSearch.prop('createNewOption')).toEqual(expect.any(Function));
            expect(selectSearch.prop('createPrompt')).toBe(GROUP_PROMPT);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('componentWillReceiveProps', () => {
            it('should be called when new props are passed', () => {
                const componentWillReceivePropsSpy = spyOn('componentWillReceiveProps');
                const { wrapper, instance } = setup();
                const nextProps = { ...baseProps, add: true };

                wrapper.setProps(nextProps);

                expect(componentWillReceivePropsSpy).toHaveBeenCalledTimes(1);
                expect(componentWillReceivePropsSpy).toHaveBeenCalledWith(
                    nextProps,
                    expect.any(Object)
                );

                componentWillReceivePropsSpy.mockRestore();
            });

            it('should update state if new groups are passed through props', () => {
                const setStateSpy = spyOn('setState');
                const groups = getGroups(2);
                const { wrapper, instance } = setup(true, {
                    groups: set(groups)
                });
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
                const setStateSpy = spyOn('setState');
                const groups = getGroups(3);
                const { wrapper, instance, props: { onChange } } = setup();

                instance.onChange(groups);

                expect(setStateSpy).toHaveBeenCalledWith({ groups }, expect.any(Function));
            });

            it("should call 'onChange' prop if passed", () => {
                const groups = getGroups(3);
                const { wrapper, props, instance } = setup(true, {
                    onChange: setMock()
                });

                instance.onChange(groups);

                expect(props.onChange).toHaveBeenCalledTimes(1);
                expect(props.onChange).toHaveBeenCalledWith(groups);
            });
        });

        describe('validate', () => {
            it('should return false, update errors state not valid', () => {
                const { wrapper, instance, props: { name } } = setup(true, {
                    required: setTrue()
                });

                expect(instance.validate()).toBeFalsy();
                expect(wrapper.state('errors')[0]).toBe(`${name} is required.`);
            });

            it('should return true if valid', () => {
                const groups = getGroups(2);
                const { wrapper, instance, props: { name } } = setup(true, {
                    required: setTrue()
                });

                expect(instance.onChange(groups));
                expect(instance.validate()).toBeTruthy();
            });
        });
    });
});
