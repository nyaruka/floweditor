import { createServiceCallSplitNode } from 'components/flow/routers/helpers';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { OpenTicket, SwitchRouter, Topic, User } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, FormEntry } from 'store/nodeEditor';
import { TicketRouterFormState } from 'components/flow/routers/ticket/TicketRouterForm';
import { store } from 'store';

export const getUserName = (user: User): string => {
  if (user.name) {
    return user.name;
  }

  if (!user.first_name && !user.last_name) {
    return user.email || '';
  }
  return `${user.first_name} ${user.last_name}`;
};

export const getOriginalAction = (settings: NodeEditorSettings): OpenTicket => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions?.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.open_ticket) {
    return action as OpenTicket;
  }
};

export const nodeToState = async (settings: NodeEditorSettings): Promise<TicketRouterFormState> => {
  const router = settings.originalNode.node.router as SwitchRouter;

  let note = { value: '' };
  let resultName = { value: '' };
  let assignee: FormEntry = { value: null };
  let topic: FormEntry = { value: null };

  if (getType(settings.originalNode) === Types.split_by_ticket) {
    const action = getOriginalAction(settings) as OpenTicket;
    topic = { value: action.topic };
    note = { value: action.note };
    assignee = { value: action.assignee };

    if (!action.assignee?.uuid) {
      // create a mutable shallow copy of the action and its assignee
      const mutableAction: OpenTicket = {
        ...action,
        assignee: action.assignee ? { ...action.assignee } : null
      };

      await store.resolveUsers([mutableAction], ['assignee']);

      if (mutableAction.assignee) {
        assignee.value = mutableAction.assignee;
      }
    }

    resultName = { value: router?.result_name || '' };
  }

  const state: TicketRouterFormState = {
    assignee,
    topic,
    note,
    resultName,
    valid: true,
    loaded: true
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

  const topic = state.topic.value as Topic;
  const assignee = state.assignee.value as User;
  const newAction: OpenTicket = {
    uuid,
    type: Types.open_ticket,
    topic: topic ? { uuid: topic.uuid, name: topic.name } : null,
    note: state.note.value,
    assignee: assignee
      ? assignee.uuid
        ? { uuid: assignee.uuid, name: getUserName(assignee) }
        : { email: assignee.email, name: getUserName(assignee) }
      : null
  };

  return createServiceCallSplitNode(
    newAction,
    settings.originalNode,
    '@locals._new_ticket',
    Operators.has_text,
    [],
    state.resultName.value
  );
};
