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
mock(utils, 'createUUID', utils.seededUUIDs());

// map this to the proper setup before each
let setupTest;

describe(SubflowRouterForm.name, () => {
  beforeAll(() => {
    mock(utils, 'createUUID', utils.seededUUIDs());
    const msgRouterNode = createSubflowNode(createStartFlowAction(), FlowTypes.MESSAGING);
    const composed = composeComponentTestUtils(
      SubflowRouterForm,
      getRouterFormProps(msgRouterNode)
    );
    setupTest = composed.setup;
  });

  describe('msg render', () => {
    it('should render', () => {
      const { wrapper } = setupTest();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('msg updates', () => {
    it('should update and save', () => {
      const { instance, props } = setupTest(true, { updateRouter: setMock() });
      expect(instance.context.config.flowType).toEqual(FlowTypes.MESSAGING);
      instance.handleFlowChanged([ColorFlowAsset]);
      expect(instance.state).toMatchSnapshot();
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const { instance, props } = setupTest(true, { updateRouter: setMock() });
      expect(instance.context.config.flowType).toEqual(FlowTypes.MESSAGING);
      instance.handleFlowChanged([ColorFlowAsset]);
      instance.getButtons().secondary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });

    it('converts from other node types', () => {
      const { instance, props } = setupTest(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: { ui: { $merge: { type: null } } }
        }
      });
      expect(instance.context.config.flowType).toEqual(FlowTypes.MESSAGING);

      instance.handleFlowChanged([ColorFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('creates its own action uuid if necessary', () => {
      const { instance, props } = setupTest(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: {
            node: { $merge: { actions: [] } },
            ui: { $merge: { type: null } }
          }
        }
      });
      expect(instance.context.config.flowType).toEqual(FlowTypes.MESSAGING);

      instance.handleFlowChanged([ColorFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('validates before saving', () => {
      const { instance, props } = setupTest(true, { updateRouter: setMock() });
      expect(instance.context.config.flowType).toEqual(FlowTypes.MESSAGING);
      instance.handleFlowChanged([]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });
  });
});

describe(SubflowRouterForm.name, () => {
  beforeAll(() => {
    const voiceRouterNode = createSubflowNode(createVoiceStartFlowAction(), FlowTypes.VOICE);
    const composed = composeComponentTestUtils(
      SubflowRouterForm,
      getRouterFormProps(voiceRouterNode),
      FlowTypes.VOICE
    );
    setupTest = composed.setup;
  });

  describe('ivr render', () => {
    it('should render', () => {
      const { wrapper } = setupTest();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('ivr updates', () => {
    it('should update and save', () => {
      const { instance, props } = setupTest(true, { updateRouter: setMock() });
      expect(instance.context.config.flowType).toEqual(FlowTypes.VOICE);
      instance.handleFlowChanged([SoundFlowAsset]);
      expect(instance.state).toMatchSnapshot();
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const { instance, props } = setupTest(true, { updateRouter: setMock() });
      expect(instance.context.config.flowType).toEqual(FlowTypes.VOICE);
      instance.handleFlowChanged([SoundFlowAsset]);
      instance.getButtons().secondary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });

    it('converts from other node types', () => {
      const { instance, props } = setupTest(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: { ui: { $merge: { type: null } } }
        }
      });
      expect(instance.context.config.flowType).toEqual(FlowTypes.VOICE);

      instance.handleFlowChanged([SoundFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('creates its own action uuid if necessary', () => {
      const { instance, props } = setupTest(true, {
        updateRouter: setMock(),
        nodeSettings: {
          originalNode: {
            node: { $merge: { actions: [] } },
            ui: { $merge: { type: null } }
          }
        }
      });
      expect(instance.context.config.flowType).toEqual(FlowTypes.VOICE);

      instance.handleFlowChanged([SoundFlowAsset]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('validates before saving', () => {
      const { instance, props } = setupTest(true, { updateRouter: setMock() });
      expect(instance.context.config.flowType).toEqual(FlowTypes.VOICE);
      instance.handleFlowChanged([]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });
  });
});
