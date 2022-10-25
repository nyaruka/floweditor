import { LocalizationFormProps } from 'components/flow/props';
import RouterLocalizationForm from 'components/flow/routers/localization/RouterLocalizationForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Operators } from 'config/interfaces';
import { RouterTypes, SwitchRouter, Exit, Category } from 'flowTypes';
import { getLocalizations } from 'store/helpers';
import { composeComponentTestUtils, mock } from 'testUtils';
import {
  createRenderNode,
  Spanish,
  createCategories,
  createMatchRouter
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import { getSwitchRouter } from 'components/flow/routers/helpers';

mock(utils, 'createUUID', utils.seededUUIDs());

const responseRenderNode = createMatchRouter(['Red', 'Blue']);

const router = getSwitchRouter(responseRenderNode.node);

const redCase = router.cases[0];
const otherCategory = router.categories[router.categories.length - 1];

const localizations = getLocalizations(responseRenderNode.node, null, Spanish, {
  [redCase.uuid]: { arguments: ['rojo, r'] },

  [otherCategory.uuid]: { name: ['Otro'] }
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

  // it('should display category name in second column of "rule translations" tab ', () => {
  //   // todo
  // });
});
