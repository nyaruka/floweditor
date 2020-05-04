import { composeComponentTestUtils, mock, setMock } from 'testUtils';
import {
  createOpenTicketNode,
  createOpenTicketAction,
  getRouterFormProps
} from 'testUtils/assetCreators';
import * as utils from 'utils';
import TicketRouterForm from './TicketRouterForm';

mock(utils, 'createUUID', utils.seededUUIDs());

const routerNode = createOpenTicketNode(createOpenTicketAction());
const { setup } = composeComponentTestUtils(TicketRouterForm, getRouterFormProps(routerNode));

describe(TicketRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should update and save', () => {
      const components = setup(true, { updateRouter: setMock() });
      const instance = components.instance as TicketRouterForm;

      instance.handleSubjectUpdate('New subject');
      expect(instance.state).toMatchSnapshot();
      instance.getButtons().primary.onClick();
      expect(components.props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const components = setup(true, { updateRouter: setMock() });
      const instance = components.instance as TicketRouterForm;

      instance.handleSubjectUpdate('New subject');
      instance.getButtons().secondary.onClick();
      expect(components.props.updateRouter).not.toBeCalled();
    });
  });
});
