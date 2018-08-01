import AddLabelsForm from '~/components/flow/actions/addlabels/AddLabelsForm';
import { ActionFormProps } from '~/components/flow/props';
import { Label } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';
import { createAddLabelsAction, FeedbackLabel } from '~/testUtils/assetCreators';

const { assets: labels } = require('~/test/assets/labels.json') as {
    assets: Label[];
};

const action = createAddLabelsAction(labels);
const baseProps: ActionFormProps = {
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: action
    }
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
