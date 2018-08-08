import AddLabelsForm from '~/components/flow/actions/addlabels/AddLabelsForm';
import { Label } from '~/flowTypes';
import { composeComponentTestUtils, mock } from '~/testUtils';
import {
    createAddLabelsAction,
    FeedbackLabel,
    getActionFormProps
} from '~/testUtils/assetCreators';
import * as utils from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const { results: labels } = require('~/test/assets/labels.json') as {
    results: Label[];
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
            expect(props.updateAction).toMatchCallSnapshot('update label');
        });

        it('should allow switching from router', () => {
            const { instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            instance.handleLabelChange([FeedbackLabel]);
            instance.handleSave();
            expect(props.updateAction).toMatchCallSnapshot('switch from router');
        });
    });
});
