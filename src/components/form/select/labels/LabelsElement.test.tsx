import LabelsElement, {
    CREATE_PROMPT,
    createNewOption,
    LabelsElementProps,
    NAME
} from '~/components/form/select/labels/LabelsElement';
import { Label } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { composeComponentTestUtils, configProviderContext } from '~/testUtils';
import { createSelectOption } from '~/testUtils/assetCreators';
import { isOptionUnique, isValidNewOption, V4_UUID } from '~/utils';

const { results: labels } = require('~/test/assets/labels.json') as { results: Label[] };

const baseProps: LabelsElementProps = {
    name: NAME,
    assets: configProviderContext.assetService.getLabelAssets(),
    onChange: jest.fn(),
    entry: { value: [] }
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
});
