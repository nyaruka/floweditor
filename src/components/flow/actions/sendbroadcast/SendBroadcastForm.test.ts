import SendBroadcastForm from 'components/flow/actions/sendbroadcast/SendBroadcastForm';
import { ActionFormProps } from 'components/flow/props';
import { composeComponentTestUtils, mock } from 'testUtils';
import { createBroadcastMsgAction, getActionFormProps } from 'testUtils/assetCreators';
import * as utils from 'utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const action = createBroadcastMsgAction();
const { setup } = composeComponentTestUtils<ActionFormProps>(
  SendBroadcastForm,
  getActionFormProps(action)
);

describe(SendBroadcastForm.name, () => {
  describe('render', () => {
    it('should render self, children with base props', () => {
      const { wrapper } = setup(true);
      expect(wrapper).toMatchSnapshot();
    });

    it('should render an empty form with no action', () => {
      const { wrapper, instance } = setup(true, {
        $merge: {
          nodeSettings: { originalNode: null }
        }
      });

      expect(instance.state).toMatchSnapshot();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('handles recipent change', () => {
      const { instance } = setup(true, {
        $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
      });
      instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
      expect(instance.state).toMatchSnapshot();
    });

    // todo
    // it('handles compose text change', () => {
    //   const { instance, props } = setup(true, {
    //     $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
    //   });
    //   const compose = JSON.stringify({ text: 'Message to Group', attachments: [] });
    //   instance.handleComposeChanged(compose);
    //   expect(instance.state).toMatchSnapshot();
    // });

    // todo
    // it('handles compose attachments change', () => {
    //   const { instance, props } = setup(true, {
    //     $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
    //   });
    //   const compose = JSON.stringify({ text: 'Message to Group', attachments: [] });
    //   instance.handleComposeChanged();
    //   expect(instance.state).toMatchSnapshot();
    // });

    it('should allow switching from router', () => {
      const { instance, props } = setup(true, {
        $merge: { updateAction: jest.fn() },
        nodeSettings: { $merge: { originalAction: null } }
      });

      instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
      instance.handleMessageUpdate('Message to Group');
      instance.handleSave();

      expect(props.updateAction).toMatchCallSnapshot();
    });
  });
});
