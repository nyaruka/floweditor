import { createServiceCallSplitNode } from 'components/flow/routers/helpers';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { OpenTicket } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, FormEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';
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
  let note = { value: '' };
  let resultName = { value: '' };
  let assignee: FormEntry = { value: null };
  let topic: FormEntry = { value: null };

  if (getType(settings.originalNode) === Types.split_by_ticket) {
    const action = getOriginalAction(settings) as OpenTicket;
    topic = { value: action.topic };
    note = { value: action.note };
    assignee = { value: action.assignee };
    resultName = { value: action.result_name };
  }

  const state: TicketRouterFormState = {
    assignee,
    topic,
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
    topic: state.topic.value,
    note: state.note.value,
    assignee: state.assignee.value,
    result_name: state.resultName.value
  };

  return createServiceCallSplitNode(
    newAction,
    settings.originalNode,
    '@locals._new_ticket',
    Operators.has_text,
    []
  );
};
