import { createServiceCallSplitNode } from 'components/flow/routers/helpers';
import { Operators, Types } from 'config/interfaces';
import { CallResthook, SwitchRouter } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { FormEntry, NodeEditorSettings } from 'store/nodeEditor';
import { createUUID } from 'utils';

import { ResthookRouterFormState } from './ResthookRouterForm';

export const nodeToState = (settings: NodeEditorSettings): ResthookRouterFormState => {
  const router = settings.originalNode.node.router as SwitchRouter;

  let resthookAsset: FormEntry = { value: null };
  let resultName = { value: '' };
  let valid = false;

  const originalAction = getOriginalAction(settings) as CallResthook;
  if (originalAction && originalAction.type === Types.call_resthook) {
    const resthook = originalAction.resthook;
    resthookAsset = {
      value: { resthook }
    };
    resultName = { value: originalAction.result_name || router.result_name || '' };
    valid = true;
  }

  return {
    resthook: resthookAsset,
    resultName,
    valid
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: ResthookRouterFormState
): RenderNode => {
  let uuid = createUUID();
  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }

  const newAction: CallResthook = {
    uuid,
    resthook: state.resthook.value.resthook,
    type: Types.call_resthook
  };

  // if the action had the result name, keep the result on the action rather than the router
  if (originalAction && originalAction.result_name) {
    newAction.result_name = state.resultName.value;
  }

  return createServiceCallSplitNode(
    newAction,
    settings.originalNode,
    '@webhook.status',
    Operators.has_number_between,
    ['200', '299'],
    newAction.result_name ? '' : state.resultName.value // put result on router if not on action
  );
};

export const getOriginalAction = (settings: NodeEditorSettings): CallResthook => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.call_resthook) {
    return action as CallResthook;
  }
};
