import SubflowRouterForm from 'components/flow/routers/subflow/SubflowRouterForm';
import { FlowTypes } from 'config/interfaces';
import { composeComponentTestUtils, mock, setMock } from 'testUtils';
import {
  ColorFlowAsset,
  SoundFlowAsset,
  createStartFlowAction,
  createVoiceStartFlowAction,
  createSubflowNode,
  getRouterFormProps
} from 'testUtils/assetCreators';
import * as utils from 'utils';

const msgRouterNode = createSubflowNode(createStartFlowAction(), null, FlowTypes.MESSAGING);
const { setup: msgSetup } = composeComponentTestUtils(
  SubflowRouterForm,
  getRouterFormProps(msgRouterNode)
);
mock(utils, 'createUUID', utils.seededUUIDs());

describe(SubflowRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = msgSetup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should update and save', () => {
      const { instance, props } = msgSetup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([ColorFlowAsset]);
      expect(instance.state).toMatchSnapshot();
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const { instance, props } = msgSetup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([ColorFlowAsset]);
      instance.getButtons().secondary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });

    it('converts from other node types', () => {
      const { instance, props } = msgSetup(true, {
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
      const { instance, props } = msgSetup(true, {
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
      const { instance, props } = msgSetup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });
  });
});

const voiceRouterNode = createSubflowNode(createVoiceStartFlowAction(), null, FlowTypes.VOICE);
const { setup: voiceSetup } = composeComponentTestUtils(
  SubflowRouterForm,
  getRouterFormProps(voiceRouterNode)
);
mock(utils, 'createUUID', utils.seededUUIDs());

describe(SubflowRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = voiceSetup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should update and save', () => {
      const { instance, props } = voiceSetup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([SoundFlowAsset]);
      expect(instance.state).toMatchSnapshot();
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const { instance, props } = voiceSetup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([SoundFlowAsset]);
      instance.getButtons().secondary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });

    it('converts from other node types', () => {
      const { instance, props } = voiceSetup(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: { ui: { $merge: { type: null } } }
        }
      });

      instance.handleFlowChanged([SoundFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('creates its own action uuid if necessary', () => {
      const { instance, props } = voiceSetup(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: {
            node: { $merge: { actions: [] } },
            ui: { $merge: { type: null } }
          }
        }
      });

      instance.handleFlowChanged([SoundFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('validates before saving', () => {
      const { instance, props } = voiceSetup(true, { updateRouter: setMock() });
      instance.handleFlowChanged([]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });
  });
});
