import { mock } from 'testUtils';
import { createOpenTicketNode, getRouterFormProps } from 'testUtils/assetCreators';
import { Types } from 'config/interfaces';
import { RenderNode } from 'store/flowContext';
import TicketRouterForm, { TicketRouterFormState } from './TicketRouterForm';
import { stateToNode, nodeToState } from './helpers';
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
    it('should preserve email-only assignees when saving', () => {
      // Create a simple test to check backwards compatibility logic in stateToNode
      const mockSettings: any = {
        originalNode: {
          node: {
            actions: [],
            router: { result_name: 'test' },
            exits: []
          }
        }
      };

      const stateWithEmailOnlyAssignee: TicketRouterFormState = {
        assignee: {
          value: {
            email: 'legacy.user@gmail.com',
            name: 'Legacy User', // This name would have been saved previously
            first_name: 'Legacy',
            last_name: 'User'
          }
        },
        topic: { value: { uuid: 'topic-uuid', name: 'General' } },
        note: { value: 'Test note' },
        resultName: { value: 'TestResult' },
        valid: true
      };

      const result = stateToNode(mockSettings, stateWithEmailOnlyAssignee);

      // Should preserve email format for email-only users (those without uuid)
      expect(result.node.actions[0].assignee).toEqual({
        email: 'legacy.user@gmail.com',
        name: 'Legacy User'
      });
    });

    it('should use uuid format for users with uuid', () => {
      // Create a simple test to check new format logic in stateToNode
      const mockSettings: any = {
        originalNode: {
          node: {
            actions: [],
            router: { result_name: 'test' },
            exits: []
          }
        }
      };

      const stateWithUuidAssignee: TicketRouterFormState = {
        assignee: {
          value: {
            uuid: 'user-uuid-123',
            email: 'new.user@gmail.com',
            first_name: 'New',
            last_name: 'User'
          }
        },
        topic: { value: { uuid: 'topic-uuid', name: 'General' } },
        note: { value: 'Test note' },
        resultName: { value: 'TestResult' },
        valid: true
      };

      const result = stateToNode(mockSettings, stateWithUuidAssignee);

      // Should use uuid format for users with uuid
      expect(result.node.actions[0].assignee).toEqual({
        uuid: 'user-uuid-123',
        name: 'New User'
      });
    });

    it('should demonstrate the valueKey issue with legacy assignees', () => {
      // Create a proper mock with legacy assignee structure 
      const legacyNode = createOpenTicketNode('Need help', 'Where are my cookies');
      
      // Add a legacy assignee to the action (email only, no UUID)
      legacyNode.actions[0].assignee = { email: 'legacy.user@gmail.com', name: 'Legacy User' };
      
      const mockSettings: any = {
        originalNode: {
          node: legacyNode,
          ui: { type: Types.split_by_ticket }
        }
      };

      // Test what happens when we initialize the form state with a legacy assignee
      const initialState = nodeToState(mockSettings);
      
      // The assignee should be loaded from the legacy format
      expect(initialState.assignee.value).toEqual({
        email: 'legacy.user@gmail.com', 
        name: 'Legacy User'
      });
      
      // When assignee has no UUID, the current logic sets valueKey to 'email'
      // This is the source of the issue
      const expectValueKey = initialState.assignee.value?.uuid ? 'uuid' : 'email';
      expect(expectValueKey).toBe('email'); // This demonstrates the problem
    });

    it('should use uuid valueKey regardless of current assignee type', () => {
      // Test that the TembaSelect always uses 'uuid' as valueKey now
      const legacyNode = createOpenTicketNode('Need help', 'Where are my cookies');
      legacyNode.actions[0].assignee = { email: 'legacy.user@gmail.com', name: 'Legacy User' };
      
      const legacyFormProps = getRouterFormProps({
        node: legacyNode,
        ui: { type: Types.split_by_ticket }
      } as RenderNode);

      const { getByTestId } = render(<TicketRouterForm {...legacyFormProps} />);
      const assigneeSelect = getByTestId('temba_select_assignee');
      
      // The select should always use 'uuid' as valueKey, even when current assignee is email-only
      expect(assigneeSelect.getAttribute('valuekey')).toBe('uuid');
    });
  });
});
