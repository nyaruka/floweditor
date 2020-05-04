import { createWebhookBasedNode } from 'components/flow/routers/helpers';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { OpenTicket } from 'flowTypes';
import { RenderNode, AssetType } from 'store/flowContext';
import { NodeEditorSettings, AssetEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { TicketRouterFormState } from 'components/flow/routers/ticket/TicketRouterForm';

export const nodeToState = (settings: NodeEditorSettings): TicketRouterFormState => {
  let ticketer: AssetEntry = { value: null };
  let subject = { value: '' };
  let body = { value: '' };
  let resultName = { value: 'Result' };

  if (getType(settings.originalNode) === Types.open_ticket) {
    const action = getOriginalAction(settings) as OpenTicket;

    subject = { value: action.subject };
    body = { value: action.body };

    const { uuid: id, name } = action.ticketer;
    ticketer = { value: { id, name, type: AssetType.Ticketer } };
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
      uuid: state.ticketer.value.id,
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
