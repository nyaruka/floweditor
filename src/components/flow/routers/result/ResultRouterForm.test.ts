import { RouterFormProps } from '~/components/flow/props';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import FieldRouterForm from '~/components/flow/routers/result/ResultRouterForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Operators, Types } from '~/config/interfaces';
import { RouterTypes, SwitchRouter } from '~/flowTypes';
import { AssetType } from '~/store/flowContext';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createRenderNode, getRouterFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

const { setup } = composeComponentTestUtils<RouterFormProps>(
    FieldRouterForm,
    getRouterFormProps(
        createRenderNode({
            actions: [],
            exits: [],
            ui: {
                position: { left: 0, top: 0 },
                type: Types.split_by_contact_field,
                config: {
                    id: 'favorite_color',
                    type: AssetType.Field
                }
            }
        })
    )
);

mock(utils, 'createUUID', utils.seededUUIDs());

const exitOneUUID = utils.createUUID();
const redCaseUUID = utils.createUUID();

xdescribe(FieldRouterForm.name, () => {
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
                        exits: [{ destination_uuid: null, uuid: exitOneUUID }],
                        router: {
                            type: RouterTypes.switch,
                            operand: DEFAULT_OPERAND,
                            categories: [
                                { name: 'Other', uuid: utils.createUUID(), exit_uuid: exitOneUUID }
                            ],
                            cases: [],
                            default_category_uuid: exitOneUUID,
                            result_name: 'Color'
                        } as SwitchRouter,
                        ui: {
                            position: { left: 0, top: 0 },
                            type: Types.split_by_contact_field,
                            config: {
                                id: 'favorite_color',
                                type: AssetType.Field
                            }
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
                { kase: { type: Operators.has_any_word, arguments: ['red'] }, categoryName: 'Red' },
                {
                    kase: { type: Operators.has_any_word, arguments: ['maroon'] },
                    categoryName: 'Red'
                },
                {
                    kase: { type: Operators.has_any_word, arguments: ['green'] },
                    categoryName: 'Green'
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
                $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
            });

            instance.handleFieldChanged({ id: 'viber', name: 'Viber', type: AssetType.URN });
            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).not.toHaveBeenCalled();
        });
    });
});
