import { composeComponentTestUtils, mock, setMock } from 'testUtils';
import {
  getRouterFormProps,
  createResthookNode,
  createCallResthookAction,
  ResthookAsset
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import ResthookRouterForm from 'components/flow/routers/resthook/ResthookRouterForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createResthookNode(createCallResthookAction());
const { setup } = composeComponentTestUtils(ResthookRouterForm, getRouterFormProps(routerNode));

describe(ResthookRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should update and save', () => {
      const components = setup(true, { updateRouter: setMock() });
      const instance = components.instance as ResthookRouterForm;

      instance.handleResthookChanged([ResthookAsset]);
      expect(instance.state).toMatchSnapshot();
      instance.getButtons().primary.onClick();
      expect(components.props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const components = setup(true, { updateRouter: setMock() });
      const instance = components.instance as ResthookRouterForm;

      instance.handleResthookChanged([ResthookAsset]);
      instance.getButtons().secondary.onClick();
      expect(components.props.updateRouter).not.toBeCalled();
    });

    it('coverts from other node types', () => {
      const components = setup(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: { ui: { $merge: { type: null } } }
        }
      });

      const instance = components.instance as ResthookRouterForm;
      instance.handleResthookChanged([ResthookAsset]);
      instance.getButtons().primary.onClick();
      expect(components.props.updateRouter).toMatchCallSnapshot();
    });

    it('creates its own action uuid if necessary', () => {
      const components = setup(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: {
            node: { $merge: { actions: [] } },
            ui: { $merge: { type: null } }
          }
        }
      });

      const instance = components.instance as ResthookRouterForm;

      instance.handleResthookChanged([ResthookAsset]);
      instance.getButtons().primary.onClick();
      expect(components.props.updateRouter).toMatchCallSnapshot();
    });

    it('validates before saving', () => {
      const components = setup(true, { updateRouter: setMock() });
      const instance = components.instance as ResthookRouterForm;

      instance.handleResthookChanged([]);
      instance.getButtons().primary.onClick();
      expect(components.props.updateRouter).not.toBeCalled();
    });
  });
});
