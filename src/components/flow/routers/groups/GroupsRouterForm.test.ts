import GroupsRouterForm from 'components/flow/routers/groups/GroupsRouterForm';
import { extractGroups } from 'components/flow/routers/groups/helpers';
import { SwitchRouter } from 'flowTypes';
import { composeComponentTestUtils, mock, setMock } from 'testUtils';
import {
  createGroupsRouterNode,
  getRouterFormProps,
  SubscribersGroup
} from 'testUtils/assetCreators';
import * as utils from 'utils';

const groupsRouterNode = createGroupsRouterNode();
const { setup } = composeComponentTestUtils(GroupsRouterForm, getRouterFormProps(groupsRouterNode));

mock(utils, 'createUUID', utils.seededUUIDs());

describe(GroupsRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { wrapper } = setup();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should update and save', () => {
      const { instance, props } = setup(true, { updateRouter: setMock() });
      instance.handleGroupsChanged([SubscribersGroup]);
      instance.handleUpdateResultName('My Group Result');
      expect(instance.state).toMatchSnapshot();

      instance.getButtons().primary.onClick();
      expect(props.updateRouter).toMatchCallSnapshot();
    });

    it('should cancel changes', () => {
      const { instance, props } = setup(true, { updateRouter: setMock() });
      instance.handleGroupsChanged([SubscribersGroup]);
      instance.handleUpdateResultName('My Group Result');
      instance.getButtons().secondary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });

    it('validates before saving', () => {
      const { instance, props } = setup(true, { updateRouter: setMock() });
      instance.handleGroupsChanged([]);
      instance.getButtons().primary.onClick();
      expect(props.updateRouter).not.toBeCalled();
    });
  });

  describe('helpers', () => {
    describe('extractGroups', () => {
      it('should extract groups from the exits of a groupsRouter node', () => {
        extractGroups(groupsRouterNode.node).forEach((group, idx) => {
          expect(group.name).toBe(groupsRouterNode.node.router.categories[idx].name);
          expect(group.uuid).toBe(
            (groupsRouterNode.node.router as SwitchRouter).cases[idx].arguments[0]
          );
          expect(group).toMatchSnapshot();
        });
      });
    });
  });
});
