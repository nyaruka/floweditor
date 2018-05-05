import { Asset, AssetType } from '../../services/AssetService';
import { composeComponentTestUtils, configProviderContext } from '../../testUtils';
import { set, setTrue, isValidNewOption, isOptionUnique } from '../../utils';
import AttribElement, {
    AttribElementProps,
    CREATE_PROMPT,
    createNewOption,
} from './AttribElement';

const initial: Asset = {
    id: 'name',
    name: 'Name',
    type: AssetType.Property
};

const baseProps: AttribElementProps = {
    name: 'Attribute',
    initial,
    assets: configProviderContext.assetService.getFieldAssets()
};

const { setup, spyOn } = composeComponentTestUtils(AttribElement, baseProps);

describe(AttribElement.name, () => {
    describe('helpers', () => {
        describe('createNewOption', () => {
            it('should return a new SearchResult', () => {
                const newOption = { label: 'Home Phone', labelKey: 'name', valueKey: 'id' };

                expect(createNewOption(newOption)).toEqual({
                    id: 'home_phone',
                    name: newOption.label,
                    type: AssetType.Field,
                    isNew: true
                });
            });
        });
    });

    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, instance, props: { showLabel, name, helpText, assets } } = setup();

            expect(wrapper.find('FormElement').props()).toEqual(
                expect.objectContaining({
                    showLabel,
                    name,
                    helpText,
                    errors: [],
                    attribError: false
                })
            );
            expect(wrapper.find('SelectSearch').props()).toMatchSnapshot();
            expect(wrapper).toMatchSnapshot();
        });

        it('should pass createOptions to SelectSearch', () => {
            const { wrapper } = setup(true, { add: setTrue() });

            expect(wrapper.find('SelectSearch').props()).toEqual(
                expect.objectContaining({
                    isValidNewOption,
                    isOptionUnique,
                    createNewOption,
                    createPrompt: CREATE_PROMPT
                })
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        const existingField: Asset = {
            id: '2003ec76-69e3-455e-a603-938ad90cb53f',
            name: 'National ID',
            type: AssetType.Field
        };

        describe('onChange', () => {
            it('should set state if attribute is new', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();

                instance.onChange(existingField);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ attribute: existingField });

                setStateSpy.mockRestore();
            });

            it('should not set state if attribute is not new', () => {
                const setStateSpy = spyOn('setState');
                // tslint:disable-next-line:no-shadowed-variable
                const { wrapper, instance, props: { initial } } = setup();

                instance.onChange(initial);

                expect(setStateSpy).toHaveBeenCalledTimes(0);

                setStateSpy.mockRestore();
            });
        });

        describe('getErrors', () => {
            it('should return list of errors', () => {
                const { wrapper, instance, props: { name } } = setup(true, {
                    required: setTrue(),
                    initial: set({ ...initial, name: '' })
                });

                expect(instance.getErrors()).toEqual([`${name} is required.`]);
            });

            it('should return an empty list', () => {
                const { wrapper, instance } = setup();

                expect(instance.getErrors()).toEqual([]);
            });
        });

        describe('updateErrorState', () => {
            it('should set state', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();
                const oldErrorState = [];
                const newErrorState = [`${name} is required.`];

                instance.updateErrorState(newErrorState);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ errors: newErrorState });

                setStateSpy.mockRestore();
            });
        });

        describe('validate', () => {
            it('should return true if control does not contain errors', () => {
                const updateErrorStateSpy = spyOn('updateErrorState');
                const { wrapper, instance } = setup();

                expect(instance.validate()).toBeTruthy();
                expect(updateErrorStateSpy).toHaveBeenCalledTimes(1);
                expect(updateErrorStateSpy).toHaveBeenCalledWith([]);

                updateErrorStateSpy.mockRestore();
            });

            it('should return false if control contains errors', () => {
                const updateErrorStateSpy = spyOn('updateErrorState');
                const { wrapper, instance, props: { name } } = setup(true, {
                    initial: set({ ...initial, name: '' }),
                    required: setTrue()
                });

                expect(instance.validate()).toBeFalsy();
                expect(updateErrorStateSpy).toHaveBeenCalledTimes(1);
                expect(updateErrorStateSpy).toHaveBeenCalledWith([`${name} is required.`]);

                updateErrorStateSpy.mockRestore();
            });
        });
    });
});
