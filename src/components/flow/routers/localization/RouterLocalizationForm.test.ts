import { LocalizationFormProps } from '~/components/flow/props';
import RouterLocalizationForm from '~/components/flow/routers/localization/RouterLocalizationForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Operators } from '~/config/interfaces';
import { RouterTypes, SwitchRouter } from '~/flowTypes';
import { getLocalizations } from '~/store/helpers';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createRenderNode, Spanish } from '~/testUtils/assetCreators';
import * as utils from '~/utils';
import { createUUID } from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const colorsExit = createUUID();
const otherExit = createUUID();
const redCase = createUUID();
const blueCase = createUUID();

const responseRenderNode = createRenderNode({
    actions: [],
    exits: [
        { destination_node_uuid: null, name: 'Colors', uuid: colorsExit },
        { destination_node_uuid: null, name: 'Other', uuid: otherExit }
    ],
    router: {
        type: RouterTypes.switch,
        operand: DEFAULT_OPERAND,
        cases: [
            {
                uuid: redCase,
                type: Operators.has_any_word,
                arguments: ['red'],
                exit_uuid: colorsExit
            },
            {
                uuid: blueCase,
                type: Operators.has_any_word,
                arguments: ['blue'],
                exit_uuid: colorsExit
            }
        ],
        default_exit_uuid: otherExit,
        result_name: 'Color'
    } as SwitchRouter
});

const localizations = getLocalizations(responseRenderNode.node, null, Spanish, {
    [otherExit]: { name: ['Otro'] },
    [redCase]: { arguments: ['rojo, r'] }
});

const baseProps: LocalizationFormProps = {
    language: Spanish,
    updateLocalizations: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: {
        originalNode: responseRenderNode,
        originalAction: null,
        localizations
    }
};

const { setup } = composeComponentTestUtils<LocalizationFormProps>(
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
            expect(props.updateLocalizations).toMatchCallSnapshot();
        });
    });
});
