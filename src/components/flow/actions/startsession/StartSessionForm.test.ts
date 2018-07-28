import StartSessionForm, {
    StartSessionFormProps
} from '~/components/flow/actions/startsession/StartSessionForm';
import { StartSessionFormHelper } from '~/components/flow/actions/startsession/StartSessionFormHelper';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import { createStartSessionAction } from '~/testUtils/assetCreators';

const { assets: groups } = require('~/test/assets/groups.json');

const startSessionAction = createStartSessionAction();
const typeConfig = getTypeConfig(Types.start_session);
const formHelper = new StartSessionFormHelper();

const baseProps: StartSessionFormProps = {
    formHelper,
    typeConfig,
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: { originalNode: null, originalAction: startSessionAction }
};

const { setup, spyOn } = composeComponentTestUtils<StartSessionFormProps>(
    StartSessionForm,
    baseProps
);

describe(StartSessionForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(true);
            expect(getSpecWrapper(wrapper, 'recipients').html()).toContain('Rowan Seymour');
            expect(wrapper).toMatchSnapshot();
        });

        it('should render an empty form with no action', () => {
            const { wrapper, instance } = setup(true, {
                $merge: {
                    nodeSettings: { originalNode: null, originalAction: null }
                }
            });

            expect(instance.state).toMatchSnapshot();
            expect(wrapper).toMatchSnapshot();
        });
    });
});
