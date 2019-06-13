import { getSwitchRouter } from 'components/flow/routers/helpers';
import { Types } from 'config/interfaces';
import {
  CallResthook,
  CallWebhook,
  Category,
  Exit,
  FlowNode,
  RouterTypes,
  TransferAirtime
} from 'flowTypes';
import { RenderNode } from 'store/flowContext';

export const getCategoriesForExit = (renderNode: RenderNode, exit: Exit): Category[] => {
  if (!renderNode.node.router) {
    return [];
  }
  return renderNode.node.router.categories.filter((cat: Category) => cat.exit_uuid === exit.uuid);
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
      action.type === Types.transfer_airtime
    ) {
      const resultAction = action as CallWebhook | CallResthook | TransferAirtime;
      return resultAction.result_name;
    }
  }
};
