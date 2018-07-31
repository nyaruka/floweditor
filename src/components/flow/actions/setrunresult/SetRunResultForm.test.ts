import SetRunResultForm, {
    SetRunResultFormProps
} from '~/components/flow/actions/setrunresult/SetRunResultForm';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { composeComponentTestUtils } from '~/testUtils';
import { createSetRunResultAction } from '~/testUtils/assetCreators';

const action = createSetRunResultAction();
const typeConfig = getTypeConfig(Types.send_email);

const baseProps: SetRunResultFormProps = {
    typeConfig,
    updateAction: jest.fn(),
    onClose: jest.fn(),
    onTypeChange: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: action
    }
};

const { setup } = composeComponentTestUtils<SetRunResultFormProps>(SetRunResultForm, baseProps);

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

            instance.handleNameUpdate('Result Name');
            instance.handleValueUpdate('Result Value');
            instance.handleCategoryUpdate('Result Category');

            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });

    describe('cancel', () => {
        it('should cancel without changes', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateAction: jest.fn() }
            });

            instance.handleNameUpdate("Don't Save Me");
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateAction).not.toHaveBeenCalled();
        });
    });
});
