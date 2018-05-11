import { Label } from '../../../flowTypes';
import { composeComponentTestUtils, setMock } from '../../../testUtils';
import { createAddLabelsAction } from '../../../testUtils/assetCreators';
import { NAME } from '../../form/LabelsElement';
import AddLabelsForm, {
    AddLabelsFormProps,
    createNewAddLabelAction,
    mapLabelsToAssets
} from './AddLabelsForm';

const { assets: labels } = require('../../../../__test__/assets/labels.json') as {
    assets: Label[];
};

const baseProps: AddLabelsFormProps = {
    action: createAddLabelsAction(labels),
    onBindWidget: jest.fn(),
    updateAction: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(AddLabelsForm, baseProps);

describe(AddLabelsForm.name, () => {
    describe('render', () => {
        it('should pass LabelsElement labels if they exist on the action', () => {
            const { wrapper, props } = setup();

            expect(wrapper.find('LabelsElement').props()).toEqual(
                expect.objectContaining({
                    labels: mapLabelsToAssets(props.action.labels)
                })
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should pass LabelsElement an empty labels array if they do not exist on the action', () => {
            const { wrapper, props } = setup(true, { action: { $set: createAddLabelsAction([]) } });

            expect(wrapper.find('LabelsElement').props()).toEqual(
                expect.objectContaining({
                    labels: []
                })
            );
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('onValid', () => {
        it('should update action', () => {
            const { wrapper, instance, props } = setup(true, {
                action: { $set: createAddLabelsAction([]) },
                updateAction: setMock()
            });
            const widgets = {
                [NAME]: {
                    state: {
                        labels: mapLabelsToAssets(labels)
                    }
                }
            };
            const newAction = createNewAddLabelAction(props.action, widgets[NAME].state.labels);

            instance.onValid(widgets);

            expect(props.updateAction).toHaveBeenCalledTimes(1);
            expect(props.updateAction).toHaveBeenCalledWith(newAction);
        });
    });
});
