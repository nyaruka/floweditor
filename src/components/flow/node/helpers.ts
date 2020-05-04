import { getSwitchRouter } from 'components/flow/routers/helpers';
import { Types } from 'config/interfaces';
import {
  CallResthook,
  CallWebhook,
  Category,
  Exit,
  FlowNode,
  RouterTypes,
  TransferAirtime,
  Action,
  AnyAction,
  FlowIssue
} from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { getType } from 'config/typeConfigs';

export const getCategoriesForExit = (renderNode: RenderNode, exit: Exit): Category[] => {
  // if we are
  const isGroupSplit = getType(renderNode) === Types.split_by_groups;

  if (!renderNode.node.router) {
    return [];
  }
  return renderNode.node.router.categories
    .filter((cat: Category) => cat.exit_uuid === exit.uuid)
    .map((cat: Category) => {
      if (isGroupSplit) {
        return {
          ...cat
        };
      } else {
        return { ...cat, missing: false };
      }
    });
};

export const getResultName = (node: FlowNode) => {
  const switchRouter = getSwitchRouter(node);
  if (switchRouter && switchRouter.result_name) {
    return switchRouter.result_name;
  }

  if (node.router && node.router.type === RouterTypes.random) {
    return node.router.result_name;
  }

  if (node.actions.length === 1) {
    const action = node.actions[0];
    if (
      action.type === Types.call_webhook ||
      action.type === Types.call_resthook ||
      action.type === Types.open_ticket ||
      action.type === Types.transfer_airtime
    ) {
      const resultAction = action as CallWebhook | CallResthook | TransferAirtime;
      return resultAction.result_name;
    }
  }
};

export const getVisibleActions = (renderNode: RenderNode): Action[] => {
  // subflow nodes hide their set run results
  if (getType(renderNode) === Types.split_by_subflow) {
    return renderNode.node.actions.filter((action: Action) => action.type !== Types.set_run_result);
  }

  return renderNode.node.actions;
};

export const filterIssuesForAction = (
  nodeUUID: string,
  action: AnyAction,
  issues: FlowIssue[]
): FlowIssue[] => {
  return issues.filter(issue => issue.node_uuid === nodeUUID && issue.action_uuid === action.uuid);
};
