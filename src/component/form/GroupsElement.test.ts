import { composeComponentTestUtils, configProviderContext } from '../../testUtils';
import { createSelectOption, getGroups } from '../../testUtils/assetCreators';
import { validUUID } from '../../utils';
import GroupsElement, {
    createNewOption,
    GROUP_NOT_FOUND,
    GROUP_PLACEHOLDER,
    GROUP_PROMPT,
    GroupsElementProps
} from './GroupsElement';

const baseProps: GroupsElementProps = {
    name: 'Groups',
    placeholder: GROUP_PLACEHOLDER,
    searchPromptText: GROUP_NOT_FOUND,
    assets: configProviderContext.assetService.getGroupAssets(),
    onChange: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(GroupsElement, baseProps);

describe(GroupsElement.name, () => {
    describe('helpers', () => {
        describe('createNewOption', () => {
            it('should generate a new search result object', () => {
                const newGroup = createSelectOption({ label: 'Friends' });
                const newOption = createNewOption(newGroup);

                expect(validUUID(newOption.id)).toBeTruthy();
                expect(newOption.name).toBe(newGroup.label);
                expect(newOption.isNew).toBeTruthy();
            });
        });
    });

    describe('render', () => {
        it('should render self, children with required props', () => {
            const { wrapper, instance, props } = setup();
            const formElement = wrapper.find('FormElement');

            expect(formElement.prop('name')).toBe(props.name);
            expect(wrapper.find('SelectSearch').props()).toMatchSnapshot();
            expect(wrapper).toMatchSnapshot();
        });

        it("should pass createOptions object if it's add prop is true", () => {
            const { wrapper, instance } = setup(true, { add: { $set: true } });
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
                    expect.objectContaining(nextProps),
                    expect.any(Object)
                );

                componentWillReceivePropsSpy.mockRestore();
            });

            it('should update state if new groups are passed through props', () => {
                const setStateSpy = spyOn('setState');
                const groups = getGroups(2);
                const { wrapper, instance } = setup(true, {
                    groups: { $set: groups }
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

        describe('handleChange', () => {
            it('should update onChange when called', () => {
                const groups = getGroups(3);
                const { instance, props } = setup(true, { $merge: { onChange: jest.fn() } });
                instance.handleChange(groups);
                expect(props.onChange).toHaveBeenCalledWith([
                    { id: 'afaba971-8943-4dd8-860b-3561ed4f1fe1', name: 'Testers' },
                    { id: '33b28bac-b588-43e4-90de-fda77aeaf7c0', name: 'Subscribers' }
                ]);
            });
        });
    });
});
