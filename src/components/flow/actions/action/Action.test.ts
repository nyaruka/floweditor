import {
  actionBodySpecId,
  actionContainerSpecId,
  actionInteractiveDivSpecId,
  actionOverlaySpecId,
  ActionWrapper,
  ActionWrapperProps
} from 'components/flow/actions/action/Action';
import { getTypeConfig } from 'config/typeConfigs';
import { composeComponentTestUtils, getSpecWrapper, setMock } from 'testUtils';
import {
  createExit,
  createRenderNode,
  createSendMsgAction,
  createStartFlowAction,
  createSubflowNode,
  English
} from 'testUtils/assetCreators';
import { getLocalization, set, setFalse, setTrue } from 'utils';

const sendMsgAction = createSendMsgAction();
const sendMsgAction1 = createSendMsgAction({
  uuid: '0ed4b887-2924-45ea-babe-4d580cdfb000',
  text: 'Yo!'
});
const sendMsgNode = createRenderNode({
  actions: [sendMsgAction],
  exits: [createExit()]
});
const startFlowAction = createStartFlowAction();
const subflowNode = createSubflowNode(startFlowAction);
const localization = {
  spa: {
    [sendMsgAction.uuid]: {
      text: ['¡Hola!']
    }
  }
};

const baseProps: ActionWrapperProps = {
  selected: false,
  localization,
  first: true,
  action: sendMsgAction,
  render: jest.fn(),
  renderNode: sendMsgNode,
  language: English,
  translating: false,
  onOpenNodeEditor: jest.fn(),
  removeAction: jest.fn(),
  moveActionUp: jest.fn(),
  issues: [],
  assetStore: null
};

const { setup, spyOn } = composeComponentTestUtils(ActionWrapper, baseProps);

describe(ActionWrapper.name, () => {
  describe('render', () => {
    it('should render self, children with base props', () => {
      const { wrapper, props, instance } = setup(true, {
        render: setMock()
      });
      const { name } = getTypeConfig(props.action.type);
      const actionContainer = getSpecWrapper(wrapper, actionContainerSpecId);

      expect(actionContainer.prop('id')).toBe(`action-${props.action.uuid}`);
      expect(actionContainer.hasClass('action')).toBeTruthy();
      expect(getSpecWrapper(wrapper, actionOverlaySpecId).hasClass('overlay')).toBeTruthy();
      expect(getSpecWrapper(wrapper, actionInteractiveDivSpecId).exists()).toBeTruthy();
      expect(wrapper.find('TitleBar').props()).toMatchSnapshot();
      expect(getSpecWrapper(wrapper, actionBodySpecId).hasClass('body')).toBeTruthy();
      expect(props.render).toHaveBeenCalledTimes(1);
      expect(props.render).toHaveBeenCalledWith(props.action, instance.context.config.endpoints);
      expect(wrapper).toMatchSnapshot();
    });

    it('should show move icon', () => {
      const { wrapper } = setup(true, { first: setFalse() });

      expect(wrapper.find('TitleBar').prop('showMove')).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });

    it('should display translating style', () => {
      const { wrapper } = setup(true, { translating: setTrue() });

      expect(getSpecWrapper(wrapper, actionContainerSpecId).hasClass('translating')).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });

    it('should display not_localizable style', () => {
      const { wrapper } = setup(true, {
        action: set(startFlowAction),
        translating: setTrue()
      });

      expect(
        getSpecWrapper(wrapper, actionContainerSpecId).hasClass('not_localizable')
      ).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });

    it('should display hybrid style', () => {
      const { wrapper, props } = setup(true, {
        renderNode: set(subflowNode)
      });

      expect(getSpecWrapper(wrapper, actionContainerSpecId).hasClass('has_router')).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });

    it('should display missing_localization style', () => {
      const { wrapper } = setup(true, {
        action: set(sendMsgAction1),
        translating: setTrue()
      });

      expect(
        getSpecWrapper(wrapper, actionContainerSpecId).hasClass('missing_localization')
      ).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('instance methods', () => {
    describe('handleActionClicked', () => {
      it('should be called when interactive div is clicked', () => {
        const onClickSpy = spyOn('handleActionClicked');
        const { wrapper } = setup();
        const interactiveDiv = getSpecWrapper(wrapper, actionInteractiveDivSpecId);
        const mockEvent = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn()
        };

        interactiveDiv.simulate('mouseDown', mockEvent);
        interactiveDiv.simulate('mouseUp', mockEvent);

        expect(onClickSpy).toHaveBeenCalledTimes(1);

        onClickSpy.mockRestore();
      });

      it("should call 'onOpenEditor' action creator if node is not dragging", () => {
        const { props, instance } = setup(true, {
          onOpenNodeEditor: setMock()
        }) as { instance: ActionWrapper; props: ActionWrapperProps };

        const mockEvent: any = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn()
        };

        instance.handleActionClicked(mockEvent);

        expect(props.onOpenNodeEditor).toHaveBeenCalledTimes(1);
        /* 
                expect(props.onOpenNodeEditor).toHaveBeenCalledWith({
                    originalNode: props.node,
                    originalAction: props.action,
                    showAdvanced: false
                });
                */
      });
    });

    describe('handleRemoval', () => {
      it('should call removeAction action creator', () => {
        const { props, instance } = setup(true, {
          removeAction: setMock()
        }) as { instance: ActionWrapper; props: ActionWrapperProps };
        const mockEvent: any = {
          stopPropagation: jest.fn(),
          preventDefault: jest.fn()
        };

        instance.handleRemoval(mockEvent);

        expect(props.removeAction).toHaveBeenCalledTimes(1);
        expect(props.removeAction).toHaveBeenCalledWith(props.renderNode.node.uuid, props.action);
      });
    });

    describe('onMoveUp', () => {
      it('should call moveActionUp action creator', () => {
        const { props, instance } = setup(true, {
          moveActionUp: setMock()
        }) as { instance: ActionWrapper; props: ActionWrapperProps };

        const mockEvent: any = {
          stopPropagation: jest.fn(),
          preventDefault: jest.fn()
        };

        instance.handleMoveUp(mockEvent);

        expect(props.moveActionUp).toHaveBeenCalledTimes(1);
        expect(props.moveActionUp).toHaveBeenCalledWith(props.renderNode.node.uuid, props.action);
      });
    });

    describe('getAction', () => {
      it('should return the action passed via props if not localized', () => {
        const { wrapper, props, instance } = setup(true, {
          node: set(sendMsgAction1)
        });

        expect(instance.getAction()).toEqual(props.action);
      });

      it('should return localized action if localized', () => {
        const { wrapper, props, context, instance } = setup();
        const localizedObject = getLocalization(
          props.action,
          props.localization,
          props.language
        ).getObject();

        expect(instance.getAction()).toEqual(localizedObject);
      });
    });
  });
});
