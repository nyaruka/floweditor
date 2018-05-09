import { getTypeConfig } from '../../config';
import { Types } from '../../config/typeConfigs';
import { Asset, AssetType } from '../../services/AssetService';
import { composeComponentTestUtils, configProviderContext, setMock } from '../../testUtils';
import {
    createSetContactFieldAction,
    createSetContactNameAction
} from '../../testUtils/assetCreators';
import { isOptionUnique, isValidNewOption } from '../../utils';
import { fieldToAsset, propertyToAsset } from '../actions/SetContactAttrib/helpers';
import { AttribElement, AttribElementProps, CREATE_PROMPT, createNewOption } from './AttribElement';

const initial: Asset = {
    id: 'name',
    name: 'Name',
    type: AssetType.Name
};

const baseProps: AttribElementProps = {
    name: 'Attribute',
    initial,
    assets: configProviderContext.assetService.getFieldAssets(),
    updateTypeConfig: jest.fn()
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
        it('should pass createOptions to SelectSearch', () => {
            const { wrapper } = setup(true, { add: { $set: true } });

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
            id: 'field-0',
            name: 'National ID',
            type: AssetType.Field
        };

        describe('onChange', () => {
            it('should set state if attribute is new', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();

                instance.onChange(existingField);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith(
                    { attribute: existingField },
                    expect.any(Function)
                );

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

            it('should update typeConfig', () => {
                const setContactFieldAsset = fieldToAsset(createSetContactFieldAction());
                const { wrapper, instance, props } = setup(false, {
                    initial: { $set: setContactFieldAsset },
                    updateTypeConfig: setMock()
                });
                const setContactPropertyAsset = propertyToAsset(createSetContactNameAction());

                instance.onChange(setContactPropertyAsset);

                expect(props.updateTypeConfig).toHaveBeenCalledTimes(1);
                expect(props.updateTypeConfig).toHaveBeenCalledWith(
                    getTypeConfig(Types.set_contact_name)
                );
            });
        });

        describe('getErrors', () => {
            it('should return list of errors', () => {
                const { wrapper, instance, props: { name } } = setup(true, {
                    required: { $set: true },
                    initial: { $set: { ...initial, name: '' } }
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
                    initial: { $set: { ...initial, name: '' } },
                    required: { $set: true }
                });

                expect(instance.validate()).toBeFalsy();
                expect(updateErrorStateSpy).toHaveBeenCalledTimes(1);
                expect(updateErrorStateSpy).toHaveBeenCalledWith([`${name} is required.`]);

                updateErrorStateSpy.mockRestore();
            });
        });
    });
});
