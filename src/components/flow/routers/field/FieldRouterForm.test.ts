import { RouterFormProps } from 'components/flow/props';
import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { Operators, Types } from 'config/interfaces';
import { AssetType } from 'store/flowContext';
import { getUpdatedNode } from 'test/utils';
import { composeComponentTestUtils, mock } from 'testUtils';
import { createMatchRouter, getRouterFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';
import { getSwitchRouter } from '../helpers';

import FieldRouterForm from './FieldRouterForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createMatchRouter(['Red']);
routerNode.node.router.result_name = 'Color';
routerNode.ui = {
  position: { left: 0, top: 0 },
  type: Types.split_by_contact_field,
  config: {
    operand: {
      id: 'name',
      name: 'Name',
      type: AssetType.ContactProperty
    }
  }
};

const { setup } = composeComponentTestUtils<RouterFormProps>(
  FieldRouterForm,
  getRouterFormProps(routerNode)
);

describe(FieldRouterForm.name, () => {
  it('should render', () => {
    const { wrapper } = setup(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('initializes', () => {
    const { wrapper } = setup(true, {
      nodeSettings: {
        $set: {
          originalNode: routerNode
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
        {
          kase: { type: Operators.has_any_word, arguments: ['red'] },
          categoryName: 'Red'
        },
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

      instance.handleFieldChanged([
        {
          id: 'viber',
          name: 'Viber',
          type: AssetType.URN
        }
      ]);
      instance.getButtons().secondary.onClick();
      expect(props.onClose).toHaveBeenCalled();
      expect(props.updateRouter).not.toHaveBeenCalled();
    });

    it('should build expression from a selected field', () => {
      const { instance, props } = setup(true, {
        $merge: { updateRouter: jest.fn(), onClose: jest.fn() }
      });

      instance.handleFieldChanged([
        {
          key: 'my_field',
          label: 'My Field'
        }
      ]);

      instance.handleSave();

      const node = getUpdatedNode(instance.props);
      expect(getSwitchRouter(node.node).operand).toEqual('@fields.my_field');

      expect(props.updateRouter).toHaveBeenCalled();
      expect(props.updateRouter).toMatchCallSnapshot();
    });
  });
});
