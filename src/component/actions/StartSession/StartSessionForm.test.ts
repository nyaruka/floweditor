import { getTypeConfig } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { composeComponentTestUtils, getSpecWrapper } from '../../../testUtils';
import { createStartSessionAction } from '../../../testUtils/assetCreators';
import { StartSessionForm, StartSessionFormProps } from './StartSessionForm';
import { StartSessionFormHelper } from './StartSessionFormHelper';

const { assets: groups } = require('../../../../__test__/assets/groups.json');

const startSessionAction = createStartSessionAction();
const typeConfig = getTypeConfig(Types.start_session);
const formHelper = new StartSessionFormHelper();

const baseProps: StartSessionFormProps = {
    action: startSessionAction,
    formHelper,
    typeConfig,
    updateAction: jest.fn(),
    updateStartSessionForm: jest.fn(),
    form: formHelper.actionToState(startSessionAction)
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
            const { wrapper, props } = setup(true, {
                $merge: {
                    form: formHelper.actionToState(null)
                }
            });

            expect(props.form).toEqual({
                recipients: { value: [] },
                flow: { value: null },
                type: Types.start_session,
                valid: false
            });

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('onValid', () => {
        it('processes the form for normal edits', () => {
            const { instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() }
            });
            instance.onValid();
            expect(props.updateAction).toBeCalledWith(startSessionAction);
        });
    });

    describe('event', () => {
        it('handles recipent change', () => {
            const { instance, props } = setup(true, {
                $merge: { updateStartSessionForm: jest.fn() }
            });
            instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
            expect(props.updateStartSessionForm).toBeCalledWith({
                recipients: { value: [{ id: 'group-0', name: 'My Group' }] }
            });
        });

        it('handles flow change', () => {
            const { instance, props } = setup(true, {
                $merge: { updateStartSessionForm: jest.fn() }
            });
            const flow = { id: 'flow-1', name: 'My Other Flow' };
            instance.handleFlowChanged([flow]);
            expect(props.updateStartSessionForm).toBeCalledWith({ flow: { value: flow } });
        });
    });
});
