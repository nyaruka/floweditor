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

const attribute: Asset = {
    id: 'name',
    name: 'Name',
    type: AssetType.Name
};

const baseProps: AttribElementProps = {
    name: 'Attribute',
    attribute,
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
        describe('onChange', () => {
            it('should update type config if passed an contact name asset', () => {
                const { wrapper, instance, props } = setup(true, { updateTypeConfig: setMock() });

                instance.onChange([props.attribute]);

                expect(props.updateTypeConfig).toHaveBeenCalledTimes(1);
                expect(props.updateTypeConfig).toHaveBeenCalledWith(
                    getTypeConfig(Types.set_contact_name)
                );
            });

            it('should update type config if passed an contact field asset', () => {
                const { wrapper, instance, props } = setup(true, { updateTypeConfig: setMock() });
                const existingField: Asset = {
                    id: 'field-0',
                    name: 'National ID',
                    type: AssetType.Field
                };

                instance.onChange([existingField]);

                expect(props.updateTypeConfig).toHaveBeenCalledTimes(1);
                expect(props.updateTypeConfig).toHaveBeenCalledWith(
                    getTypeConfig(Types.set_contact_field)
                );
            });

            it('should call onChange handler if passed', () => {
                const { wrapper, instance, props } = setup(true, { onChange: setMock() });

                instance.onChange([props.attribute]);

                expect(props.onChange).toHaveBeenCalledTimes(1);
                expect(props.onChange).toHaveBeenCalledWith(props.attribute);
            });

            it('should update typeConfig', () => {
                const setContactFieldAsset = fieldToAsset(createSetContactFieldAction());
                const { wrapper, instance, props } = setup(false, {
                    initial: { $set: setContactFieldAsset },
                    updateTypeConfig: setMock()
                });
                const setContactPropertyAsset = propertyToAsset(createSetContactNameAction());

                instance.onChange([setContactPropertyAsset]);

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
                    attribute: { $set: null }
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
                const { wrapper, instance, props } = setup(true, {
                    attribute: { $set: null },
                    required: { $set: true }
                });

                expect(instance.validate()).toBeFalsy();
                expect(updateErrorStateSpy).toHaveBeenCalledTimes(1);
                expect(updateErrorStateSpy).toHaveBeenCalledWith([`${props.name} is required.`]);

                updateErrorStateSpy.mockRestore();
            });
        });
    });
});
