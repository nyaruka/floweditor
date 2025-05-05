import { LocalizationFormProps } from 'components/flow/props';
import RouterLocalizationForm from 'components/flow/routers/localization/RouterLocalizationForm';
import { SwitchRouter } from 'flowTypes';
import { getLocalizations } from 'store/helpers';
import { composeComponentTestUtils, mock, setupStore } from 'testUtils';
import { createMatchRouter } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { getSwitchRouter } from 'components/flow/routers/helpers';

mock(utils, 'createUUID', utils.seededUUIDs());

const responseRenderNode = createMatchRouter(['Red', 'Blue']);

const router = getSwitchRouter(responseRenderNode.node);

const redCase = router.cases[0];
const otherCategory = router.categories[router.categories.length - 1];

setupStore({ languageCode: 'spa', isTranslating: true });

const localizations = getLocalizations(responseRenderNode.node, null, {
  [redCase.uuid]: { arguments: ['rojo, r'] },
  [otherCategory.uuid]: { name: ['Otro'] }
});

const baseProps: LocalizationFormProps = {
  updateLocalizations: jest.fn(),
  onClose: jest.fn(),
  nodeSettings: {
    originalNode: responseRenderNode,
    originalAction: null,
    localizations
  },
  helpArticles: {},
  issues: [],
  assetStore: {}
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

      instance.handleUpdateCategoryName(responseRenderNode.node.router.categories[0], 'Roooojo!');
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
