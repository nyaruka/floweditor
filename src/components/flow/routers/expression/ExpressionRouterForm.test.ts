import { RouterFormProps } from '~/components/flow/props';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import ExpressionRouterForm from '~/components/flow/routers/expression/ExpressionRouterForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Operators, Types } from '~/config/interfaces';
import { RouterTypes, SwitchRouter } from '~/flowTypes';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createRenderNode, getRouterFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

const { setup } = composeComponentTestUtils<RouterFormProps>(
    ExpressionRouterForm,
    getRouterFormProps(
        createRenderNode({
            actions: [],
            exits: [],
            ui: { position: { left: 0, top: 0 }, type: Types.split_by_expression }
        })
    )
);

mock(utils, 'createUUID', utils.seededUUIDs());

describe(ExpressionRouterForm.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('initializes', () => {
        const { wrapper } = setup(true, {
            nodeSettings: {
                $set: {
                    originalNode: createRenderNode({
                        actions: [],
                        exits: [
                            { destination_node_uuid: null, name: 'Other', uuid: 'generated_uuid_1' }
                        ],
                        router: {
                            type: RouterTypes.switch,
                            operand: DEFAULT_OPERAND,
                            cases: [
                                {
                                    uuid: 'generated_uuid_2',
                                    type: Operators.has_any_word,
                                    arguments: ['red'],
                                    exit_uuid: null
                                }
                            ],
                            default_exit_uuid: 'generated_uuid_1',
                            result_name: 'Color'
                        } as SwitchRouter,
                        ui: {
                            position: { left: 0, top: 0 },
                            type: Types.split_by_expression
                        }
                    })
                }
            }
        });

        expect(wrapper).toMatchSnapshot();
    });

    describe('updates', () => {
        it('should save changes', () => {
            const { instance, props } = setup(true, {
                $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
            });

            instance.handleUpdateResultName('Favorite Color');
            instance.handleCasesUpdated([
                { kase: { type: Operators.has_any_word, arguments: ['red'] }, exitName: 'Red' },
                { kase: { type: Operators.has_any_word, arguments: ['maroon'] }, exitName: 'Red' },
                { kase: { type: Operators.has_any_word, arguments: ['green'] }, exitName: 'Green' }
            ] as CaseProps[]);

            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).toHaveBeenCalled();
            expect(props.updateRouter).toMatchCallSnapshot();
        });

        it('should cancel', () => {
            const { instance, props } = setup(true, {
                $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
            });

            instance.handleOperandUpdated('@date.now');
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).not.toHaveBeenCalled();
        });
    });
});
