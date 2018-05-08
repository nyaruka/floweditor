import { Label } from '../../flowTypes';
import { AssetType } from '../../services/AssetService';
import { composeComponentTestUtils, configProviderContext } from '../../testUtils';
import { createSelectOption } from '../../testUtils/assetCreators';
import { isOptionUnique, isValidNewOption, V4_UUID } from '../../utils';
import { mapLabelsToAssets } from '../actions/AddLabels/AddLabelsForm';
import LabelsElement, {
    CREATE_PROMPT,
    createNewOption,
    LabelsElementProps,
    NAME
} from './LabelsElement';

const { assets: labels } = require('../../../__test__/assets/labels.json') as { assets: Label[] };

const baseProps: LabelsElementProps = {
    name: NAME,
    assets: configProviderContext.assetService.getLabelAssets()
};

const { setup, spyOn } = composeComponentTestUtils(LabelsElement, baseProps);

describe(LabelsElement.name, () => {
    describe('helpers', () => {
        describe('createNewOption', () => {
            it('should create label asset option', () => {
                const [label] = labels;
                const newOption = createSelectOption({ label: label.name });

                expect(createNewOption(newOption)).toEqual({
                    id: expect.stringMatching(V4_UUID),
                    type: AssetType.Label,
                    name: label.name,
                    isNew: true
                });
            });
        });
    });

    describe('render', () => {
        it('should render form element, pass it create options', () => {
            const { wrapper } = setup();

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
        const newLabels = mapLabelsToAssets(labels);

        describe('onChange', () => {
            it('should update state labels state', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();

                instance.onChange(newLabels);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ labels: newLabels });

                setStateSpy.mockRestore();
            });
        });

        describe('validate', () => {
            it('should update error state, return false if no labels have been selected', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();
                const isValid = instance.validate();

                expect(isValid).toBeFalsy();
                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ errors: [`${NAME} is required.`] });

                setStateSpy.mockRestore();
            });

            it('should update error state, return true if labels have been selected', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();

                instance.onChange(newLabels);

                const isValid = instance.validate();

                expect(isValid).toBeTruthy();
                expect(setStateSpy).toHaveBeenCalledTimes(2);
                expect(setStateSpy).toHaveBeenCalledWith({ errors: [] });

                setStateSpy.mockRestore();
            });
        });
    });
});
