import { RouterFormProps } from 'components/flow/props';
import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import ExpressionRouterForm from 'components/flow/routers/expression/ExpressionRouterForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Operators, Types } from 'config/interfaces';
import { RouterTypes, SwitchRouter } from 'flowTypes';
import { composeComponentTestUtils, mock } from 'testUtils';
import { createRenderNode, getRouterFormProps, createMatchRouter } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { createUUID } from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createMatchRouter([]);
routerNode.ui = {
  position: { left: 0, top: 0 },
  type: Types.split_by_expression
};

const { setup } = composeComponentTestUtils<RouterFormProps>(
  ExpressionRouterForm,
  getRouterFormProps(routerNode)
);

describe(ExpressionRouterForm.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { instance, props } = setup(true, {
        $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
      });

      instance.handleUpdateResultName('Favorite Color');
      instance.handleCasesUpdated([
        {
          kase: { type: Operators.has_any_word, arguments: ['red'] },
          categoryName: 'Red',
          valid: true
        },
        {
          kase: { type: Operators.has_any_word, arguments: ['maroon'] },
          categoryName: 'Red',
          valid: true
        },
        {
          kase: { type: Operators.has_any_word, arguments: ['green'] },
          categoryName: 'Green',
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
        $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
      });

      instance.handleOperandUpdated('@date.now');
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();
    });
  });
});
