import { Label } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { composeComponentTestUtils } from '~/testUtils';
import { createAddLabelsAction } from '~/testUtils/assetCreators';
import { setTrue } from '~/utils';

import { AddLabelsForm, AddLabelsFormProps } from './AddLabelsForm';
import { AddLabelsFormHelper } from './AddLabelsFormHelper';

const { assets: labels } = require('~/test/assets/labels.json') as {
    assets: Label[];
};

const formHelper = new AddLabelsFormHelper();
const action = createAddLabelsAction(labels);
const baseProps: AddLabelsFormProps = {
    action,
    updateAction: jest.fn(),
    updateAddLabelsForm: jest.fn(),
    form: formHelper.initializeForm({ originalNode: null, originalAction: action }),
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

    describe('onValid', () => {
        it('should update action', () => {
            const emptyAction = createAddLabelsAction([]);
            const { wrapper, instance, props } = setup(true, {
                action: { $set: emptyAction },
                form: {
                    $set: formHelper.initializeForm({
                        originalNode: null,
                        originalAction: emptyAction
                    })
                },
                updateAction: { $set: jest.fn() },
                updateAddLabelsForm: { $set: jest.fn().mockReturnValue(setTrue) }
            });

            instance.handleLabelChange([
                { id: 'label0', name: 'Updated Label', type: AssetType.Label }
            ]);

            instance.onValid();
            expect(props.updateAction).toHaveBeenCalledTimes(1);
            expect(props.updateAction).toHaveBeenCalledWith({
                labels: [],
                type: 'add_input_labels',
                uuid: 'labels-action-uuid-0'
            });
        });
    });
});
