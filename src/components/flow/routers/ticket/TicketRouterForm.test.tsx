import { mock } from 'testUtils';
import { createOpenTicketNode, getRouterFormProps } from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { RenderNode } from 'store/flowContext';
import TicketRouterForm from './TicketRouterForm';
import * as utils from 'utils';
import * as React from 'react';
import { render, fireEvent, fireChangeText, fireTembaSelect } from 'test/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
const ticketForm = getRouterFormProps({
  node: createOpenTicketNode('Need help', 'Where are my cookies'),
  ui: { type: Types.split_by_ticket }
} as RenderNode);

describe(TicketRouterForm.name, () => {
  describe('render', () => {
    it('should render', () => {
      const { baseElement } = render(<TicketRouterForm {...ticketForm} />);
      expect(baseElement).toMatchSnapshot();
    });
  });

  describe('updates', () => {
    it('should save changes', () => {
      const { baseElement, getByText, getAllByTestId, getByTestId, getByLabelText } = render(
        <TicketRouterForm {...ticketForm} />
      );
      expect(baseElement).toMatchSnapshot();

      const okButton = getByText('Ok');

      // select an assignee
      fireTembaSelect(getByTestId('temba_select_assignee'), {
        uuid: 'agent-user-uuid',
        email: 'agent.user@gmail.com',
        first_name: 'Agent',
        last_name: 'User',
        role: 'agent',
        created_on: '2021-06-10T21:44:30.971221Z'
      });

      // select a topic
      fireTembaSelect(getByTestId('temba_select_topic'), {
        name: 'General',
        uuid: '6f38eba0-d673-4a35-82df-21bae2b6d466'
      });

      // set a result name
      const toggleLink = getByTestId('toggle-link');
      toggleLink.click();

      const resultName = getByTestId('Result Name');
      fireChangeText(resultName, 'My Ticket Result');

      fireEvent.click(okButton);
      expect(ticketForm.updateRouter).toBeCalled();
      expect(ticketForm.updateRouter).toMatchCallSnapshot();
    });
  });

  describe('backwards compatibility', () => {
    it('should handle existing email-only assignments', () => {
      // Create a ticket form with an existing email-only assignee
      const baseNode = createOpenTicketNode('Need help', 'Where are my cookies');
      const ticketFormWithEmailAssignee = getRouterFormProps({
        node: {
          ...baseNode.node,
          actions: [{
            uuid: 'b1f332f3-bdd3-4891-aec5-1843a712dbf1',
            type: Types.open_ticket,
            note: 'Where are my cookies',
            assignee: { email: 'legacy.user@gmail.com', name: 'Legacy User' }
          }]
        },
        ui: { type: Types.split_by_ticket },
        inboundConnections: {}
      } as RenderNode);

      const { getByText } = render(<TicketRouterForm {...ticketFormWithEmailAssignee} />);
      
      const okButton = getByText('Ok');
      fireEvent.click(okButton);
      
      // Verify that the email-only assignee is preserved
      expect(ticketFormWithEmailAssignee.updateRouter).toBeCalled();
      const savedNode = ticketFormWithEmailAssignee.updateRouter.mock.calls[0][0];
      expect(savedNode.node.actions[0].assignee).toEqual({
        email: 'legacy.user@gmail.com',
        name: 'Legacy User'
      });
    });
  });
});
