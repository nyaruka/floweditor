import AddLabelsForm, {
    AddLabelsFormProps
} from '~/components/flow/actions/addlabels/AddLabelsForm';
import { AddLabelsFormHelper } from '~/components/flow/actions/addlabels/AddLabelsFormHelper';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { Label } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';
import { createAddLabelsAction } from '~/testUtils/assetCreators';

const { assets: labels } = require('~/test/assets/labels.json') as {
    assets: Label[];
};

const formHelper = new AddLabelsFormHelper();
const action = createAddLabelsAction(labels);
const sendConfig = getTypeConfig(Types.send_broadcast);

const baseProps: AddLabelsFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: action
    },
    typeConfig: sendConfig,
    formHelper
};

const { setup, spyOn } = composeComponentTestUtils(AddLabelsForm, baseProps);

describe(AddLabelsForm.name, () => {
    describe('render', () => {
        it('should pass LabelsElement labels if they exist on the action', () => {
            const { wrapper } = setup();
            expect(wrapper).toMatchSnapshot();
        });
    });
});
