import RouterLocalizationForm, {
    RouterLocalizationFormProps
} from '~/components/flow/routers/localization/RouterLocalizationForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Operators } from '~/config/operatorConfigs';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { RouterTypes, SwitchRouter } from '~/flowTypes';
import { getLocalizations } from '~/store/helpers';
import { composeComponentTestUtils } from '~/testUtils';
import { createRenderNode, Spanish } from '~/testUtils/assetCreators';

const typeConfig = getTypeConfig(Types.wait_for_response);

const responseRenderNode = createRenderNode({
    actions: [],
    exits: [
        { destination_node_uuid: null, name: 'Colors', uuid: 'generated_uuid_1' },
        { destination_node_uuid: null, name: 'Other', uuid: 'generated_uuid_2' }
    ],
    router: {
        type: RouterTypes.switch,
        operand: DEFAULT_OPERAND,
        cases: [
            {
                uuid: 'generated_uuid_3',
                type: Operators.has_any_word,
                arguments: ['red'],
                exit_uuid: 'generated_uuid_1'
            },
            {
                uuid: 'generated_uuid_4',
                type: Operators.has_any_word,
                arguments: ['blue'],
                exit_uuid: 'generated_uuid_1'
            }
        ],
        default_exit_uuid: 'generated_uuid_1',
        result_name: 'Color'
    } as SwitchRouter
});

const localizations = getLocalizations(responseRenderNode.node, null, Spanish, {
    generated_uuid_2: { name: ['Otro'] },
    generated_uuid_3: { arguments: ['rojo, r'] }
});

const baseProps: RouterLocalizationFormProps = {
    typeConfig,
    language: Spanish,
    updateLocalizations: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: {
        originalNode: responseRenderNode,
        originalAction: null,
        localizations
    }
};

const { setup } = composeComponentTestUtils<RouterLocalizationFormProps>(
    RouterLocalizationForm,
    baseProps
);

describe(RouterLocalizationForm.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });

    it('initializes', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });

    describe('updates', () => {
        it('should save changes', () => {
            const { instance, props } = setup(true);

            instance.handleUpdateExitName(responseRenderNode.node.exits[0], 'Roooojo!');
            instance.handleUpdateCaseArgument(
                (responseRenderNode.node.router as SwitchRouter).cases[0],
                'Red, r, rolo, maroon'
            );
            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.updateLocalizations).toHaveBeenCalled();
            expect((props.updateLocalizations as any).mock.calls[0]).toMatchSnapshot();
        });
    });
});
