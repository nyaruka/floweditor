import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Operators } from '~/config/operatorConfigs';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { RouterTypes, SwitchRouter, WaitTypes } from '~/flowTypes';
import { composeComponentTestUtils, mockClear } from '~/testUtils';
import { createRenderNode } from '~/testUtils/assetCreators';

import ResponseRouterForm, { ResponseRouterFormProps } from './ResponseRouterForm';

const sendConfig = getTypeConfig(Types.wait_for_response);
const baseProps: ResponseRouterFormProps = {
    typeConfig: sendConfig,
    language: null,
    translating: false,
    updateRouter: jest.fn(),
    onClose: jest.fn(),
    onTypeChange: jest.fn(),
    nodeSettings: {
        originalNode: createRenderNode({ actions: [], exits: [] }),
        originalAction: null
    }
};

const { setup, spyOn } = composeComponentTestUtils<ResponseRouterFormProps>(
    ResponseRouterForm,
    baseProps
);

let mockUuidCounts = 1;
jest.mock('uuid', () => {
    return {
        v4: jest.fn(() => `generated_uuid_${mockUuidCounts++}`)
    };
});

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
                            { destination_node_uuid: null, name: 'Other', uuid: 'generated_uuid_1' }
                        ],
                        wait: { type: WaitTypes.msg },
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
            const { instance, props } = setup(true);

            instance.handleUpdateTimeout(180);
            instance.handleUpdateResultName('Favorite Color');
            instance.handleCasesUpdated([
                { kase: { type: Operators.has_any_word, arguments: ['red'] }, exitName: 'Red' },
                { kase: { type: Operators.has_any_word, arguments: ['maroon'] }, exitName: 'Red' },
                { kase: { type: Operators.has_any_word, arguments: ['green'] }, exitName: 'Green' }
            ] as CaseProps[]);

            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.updateRouter).toHaveBeenCalled();
            expect((props.updateRouter as any).mock.calls[0][0]).toMatchSnapshot();
        });

        it('should cancel', () => {
            const { instance, props } = setup(true);
            mockClear(props.updateRouter);
            mockClear(props.onClose);

            instance.handleUpdateTimeout(180);
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).not.toHaveBeenCalled();
        });
    });

    describe('localization', () => {
        it('should render', () => {
            const { wrapper } = setup(true, { translating: { $set: true } });
            expect(wrapper).toMatchSnapshot();
        });
    });
});
