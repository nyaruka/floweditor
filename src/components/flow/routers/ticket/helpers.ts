import { createWebhookBasedNode } from 'components/flow/routers/helpers';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { OpenTicket } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, FormEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { TicketRouterFormState } from 'components/flow/routers/ticket/TicketRouterForm';

export const nodeToState = (settings: NodeEditorSettings): TicketRouterFormState => {
  let ticketer: FormEntry = { value: null };
  let subject = { value: '@run.flow.name' };
  let body = { value: '@results' };
  let resultName = { value: 'Result' };

  if (getType(settings.originalNode) === Types.split_by_ticket) {
    const action = getOriginalAction(settings) as OpenTicket;
    ticketer = { value: action.ticketer };
    subject = { value: action.subject };
    body = { value: action.body };
    resultName = { value: action.result_name };
  }

  const state: TicketRouterFormState = {
    ticketer,
    subject,
    body,
    resultName,
    valid: true
  };

  return state;
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: TicketRouterFormState
): RenderNode => {
  let uuid = createUUID();
  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }

  const newAction: OpenTicket = {
    uuid,
    type: Types.open_ticket,
    ticketer: {
      uuid: state.ticketer.value.uuid,
      name: state.ticketer.value.name
    },
    subject: state.subject.value,
    body: state.body.value,
    result_name: state.resultName.value
  };

  return createWebhookBasedNode(newAction, settings.originalNode, true);
};

export const getOriginalAction = (settings: NodeEditorSettings): OpenTicket => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.open_ticket) {
    return action as OpenTicket;
  }
};
