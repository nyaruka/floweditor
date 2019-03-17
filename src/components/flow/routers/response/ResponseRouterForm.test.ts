import { RouterFormProps } from '~/components/flow/props';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import ResponseRouterForm from '~/components/flow/routers/response/ResponseRouterForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Operators } from '~/config/interfaces';
import { Types } from '~/config/interfaces';
import { RouterTypes, SwitchRouter, WaitTypes } from '~/flowTypes';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createRenderNode, getRouterFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';
import { createUUID } from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<RouterFormProps>(
    ResponseRouterForm,
    getRouterFormProps(
        createRenderNode({
            actions: [],
            exits: [],
            ui: { position: { left: 0, top: 0 }, type: Types.wait_for_response }
        })
    )
);

const otherExit = createUUID();
const redExit = createUUID();

describe(ResponseRouterForm.name, () => {
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
                            { destination_node_uuid: null, name: 'Red', uuid: redExit },
                            { destination_node_uuid: null, name: 'Other', uuid: otherExit }
                        ],
                        wait: { type: WaitTypes.msg },
                        router: {
                            type: RouterTypes.switch,
                            operand: DEFAULT_OPERAND,
                            cases: [
                                {
                                    uuid: createUUID(),
                                    type: Operators.has_any_word,
                                    arguments: ['red'],
                                    exit_uuid: redExit
                                }
                            ],
                            default_exit_uuid: otherExit,
                            result_name: 'Color'
                        } as SwitchRouter,
                        ui: {
                            position: { left: 0, top: 0 },
                            type: Types.wait_for_response
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
                $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
            });

            instance.handleUpdateTimeout(180);
            instance.handleUpdateResultName('Favorite Color');
            instance.handleCasesUpdated([
                {
                    kase: { type: Operators.has_any_word, arguments: ['red'] },
                    exitName: 'Red',
                    valid: true
                },
                {
                    kase: { type: Operators.has_any_word, arguments: ['maroon'] },
                    exitName: 'Red',
                    valid: true
                },
                {
                    kase: { type: Operators.has_any_word, arguments: ['green'] },
                    exitName: 'Green',
                    valid: true
                }
            ] as CaseProps[]);

            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).toHaveBeenCalled();
            expect(props.updateRouter).toMatchCallSnapshot();
        });

        it('should cancel', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
            });
            instance.handleUpdateTimeout(180);
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).not.toHaveBeenCalled();
        });
    });
});
