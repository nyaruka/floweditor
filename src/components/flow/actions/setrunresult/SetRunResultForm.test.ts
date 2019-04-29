import SetRunResultForm from '~/components/flow/actions/setrunresult/SetRunResultForm';
import { ActionFormProps } from '~/components/flow/props';
import { Asset, AssetType } from '~/store/flowContext';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createSetRunResultAction, getActionFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

const { setup } = composeComponentTestUtils<ActionFormProps>(
    SetRunResultForm,
    getActionFormProps(createSetRunResultAction())
);

mock(utils, 'createUUID', utils.seededUUIDs());

const resultName: Asset = {
    name: 'Result Name',
    id: utils.snakify('Result Name'),
    type: AssetType.Result
};

describe(SetRunResultForm.name, () => {
    describe('render', () => {
        it('should render', () => {
            const { wrapper } = setup(true);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should save changes', () => {
            const { instance, props } = setup(true);

            instance.handleNameUpdate([resultName]);
            instance.handleValueUpdate('Result Value');
            instance.handleCategoryUpdate('Result Category');

            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.updateAction).toHaveBeenCalled();
            expect(props.updateAction).toMatchCallSnapshot();
        });

        it('should allow switching from router', () => {
            const { instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            instance.handleNameUpdate([resultName]);
            instance.handleValueUpdate('Result Value');
            instance.handleCategoryUpdate('Result Category');
            instance.handleSave();

            expect(props.updateAction).toMatchCallSnapshot();
        });
    });

    describe('cancel', () => {
        it('should cancel without changes', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateAction: jest.fn() }
            });

            instance.handleNameUpdate([resultName]);
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateAction).not.toHaveBeenCalled();
        });
    });
});
