import LabelsElement, {
    CREATE_PROMPT,
    LabelsElementProps,
    NAME
} from '~/components/form/select/labels/LabelsElement';
import { Label } from '~/flowTypes';
import { composeComponentTestUtils, configProviderContext } from '~/testUtils';
import { createSelectOption } from '~/testUtils/assetCreators';

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
            });
        });
    });

    describe('render', () => {
        it('should render form element, pass it create options', () => {
            const { wrapper } = setup();

            expect(wrapper.find('SelectSearch').props()).toEqual(
                expect.objectContaining({
                    createPrompt: CREATE_PROMPT
                })
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
