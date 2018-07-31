import AddLabelsForm, {
    AddLabelsFormProps
} from '~/components/flow/actions/addlabels/AddLabelsForm';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { Label } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';
import { createAddLabelsAction, FeedbackLabel } from '~/testUtils/assetCreators';

const { assets: labels } = require('~/test/assets/labels.json') as {
    assets: Label[];
};

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
    typeConfig: sendConfig
};

const { setup, spyOn } = composeComponentTestUtils(AddLabelsForm, baseProps);

describe(AddLabelsForm.name, () => {
    describe('render', () => {
        it('should render a base action', () => {
            const { wrapper } = setup();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should update and save', () => {
            const { instance, props } = setup(true);

            instance.handleLabelChange([FeedbackLabel]);
            expect(instance.state).toMatchSnapshot();
            instance.handleSave();

            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });
});
