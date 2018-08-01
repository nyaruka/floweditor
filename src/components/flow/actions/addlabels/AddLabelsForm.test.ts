import AddLabelsForm from '~/components/flow/actions/addlabels/AddLabelsForm';
import { Label } from '~/flowTypes';
import { composeComponentTestUtils } from '~/testUtils';
import {
    createAddLabelsAction,
    FeedbackLabel,
    getActionFormProps
} from '~/testUtils/assetCreators';

const { assets: labels } = require('~/test/assets/labels.json') as {
    assets: Label[];
};

const { setup } = composeComponentTestUtils(
    AddLabelsForm,
    getActionFormProps(createAddLabelsAction(labels))
);

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
