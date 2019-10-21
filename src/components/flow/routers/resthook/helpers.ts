import { createWebhookBasedNode } from 'components/flow/routers/helpers';
import { Types } from 'config/interfaces';
import { CallResthook } from 'flowTypes';
import { AssetType, RenderNode } from 'store/flowContext';
import { AssetEntry, NodeEditorSettings } from 'store/nodeEditor';
import { createUUID } from 'utils';

import { ResthookRouterFormState } from './ResthookRouterForm';

export const nodeToState = (settings: NodeEditorSettings): ResthookRouterFormState => {
  let resthookAsset: AssetEntry = { value: null };
  let resultName = { value: 'Result' };
  let valid = false;

  const originalAction = getOriginalAction(settings) as CallResthook;
  if (originalAction && originalAction.type === Types.call_resthook) {
    const resthook = originalAction.resthook;
    resthookAsset = {
      value: { id: resthook, name: resthook, type: AssetType.Resthook }
    };
    resultName = { value: originalAction.result_name };
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
    resthook: state.resthook.value.id,
    type: Types.call_resthook,
    result_name: state.resultName.value
  };

  return createWebhookBasedNode(newAction, settings.originalNode, false);
};

export const getOriginalAction = (settings: NodeEditorSettings): CallResthook => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.call_resthook) {
    return action as CallResthook;
  }
};
