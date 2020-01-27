import SubflowRouterForm from 'components/flow/routers/subflow/SubflowRouterForm';
import { composeComponentTestUtils, mock, setMock } from 'testUtils';
import {
  ColorFlowAsset,
  createStartFlowAction,
  createSubflowNode,
  getRouterFormProps
} from 'testUtils/assetCreators';
import * as utils from 'utils';

const routerNode = createSubflowNode(createStartFlowAction());
const { setup } = composeComponentTestUtils(SubflowRouterForm, getRouterFormProps(routerNode));
mock(utils, 'createUUID', utils.seededUUIDs());

describe(SubflowRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should update and save', () => {
      const { instance, props } = setup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([ColorFlowAsset]);
      expect(instance.state).toMatchSnapshot();
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const { instance, props } = setup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([ColorFlowAsset]);
      instance.getButtons().secondary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });

    it('converts from other node types', () => {
      const { instance, props } = setup(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: { ui: { $merge: { type: null } } }
        }
      });

      instance.handleFlowChanged([ColorFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('creates its own action uuid if necessary', () => {
      const { instance, props } = setup(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: {
            node: { $merge: { actions: [] } },
            ui: { $merge: { type: null } }
          }
        }
      });

      instance.handleFlowChanged([ColorFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('validates before saving', () => {
      const { instance, props } = setup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });
  });
});
