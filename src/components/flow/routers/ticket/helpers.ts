import { createServiceCallSplitNode } from 'components/flow/routers/helpers';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { OpenTicket, ServiceCallExitNames } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, FormEntry } from 'store/nodeEditor';
import { createUUID, snakify } from 'utils';
import { TicketRouterFormState } from 'components/flow/routers/ticket/TicketRouterForm';

export const getOriginalAction = (settings: NodeEditorSettings): OpenTicket => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.open_ticket) {
    return action as OpenTicket;
  }
};

export const nodeToState = (settings: NodeEditorSettings): TicketRouterFormState => {
  let subject = { value: '@run.flow.name' };
  let note = { value: '' };
  let resultName = { value: 'Result' };
  let assignee: FormEntry = { value: null };
  let topic: FormEntry = { value: null };

  if (getType(settings.originalNode) === Types.split_by_ticket) {
    const action = getOriginalAction(settings) as OpenTicket;
    subject = { value: action.subject };
    note = { value: action.body };
    topic = { value: action.topic };
    assignee = { value: action.assignee };
    resultName = { value: action.result_name };
  }

  const state: TicketRouterFormState = {
    assignee,
    topic,
    subject,
    note,
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
    body: state.note.value,
    topic: state.topic.value,
    assignee: state.assignee.value,
    result_name: state.resultName.value
  };

  return createServiceCallSplitNode(
    newAction,
    settings.originalNode,
    '@results.' + snakify(state.resultName.value),
    Operators.has_category,
    [ServiceCallExitNames.Success]
  );
};
