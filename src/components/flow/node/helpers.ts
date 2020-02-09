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
  Dependency,
  DependencyType,
  AddLabels,
  Label,
  CallClassifier,
  SetContactField,
  ChangeGroups,
  Group,
  SetContactChannel
} from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { getType } from 'config/typeConfigs';

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

export const getVisibleActions = (renderNode: RenderNode): Action[] => {
  // subflow nodes hide their set run results
  if (getType(renderNode) === Types.split_by_subflow) {
    return renderNode.node.actions.filter((action: Action) => action.type !== Types.set_run_result);
  }

  return renderNode.node.actions;
};

export const filterMissingDependenciesForAction = (
  action: AnyAction,
  dependencies: Dependency[]
) => {
  if (action.type === Types.add_input_labels) {
    return dependencies.filter((dependency: Dependency) => {
      return (
        dependency.type === DependencyType.label &&
        (action as AddLabels).labels.find((label: Label) => label.uuid === dependency.uuid)
      );
    });
  } else if (action.type === Types.call_classifier) {
    return dependencies.filter((dependency: Dependency) => {
      return (
        dependency.type === DependencyType.classifier &&
        (action as CallClassifier).classifier.uuid === dependency.uuid
      );
    });
  } else if (action.type === Types.set_contact_field) {
    return dependencies.filter((dependency: Dependency) => {
      return (
        dependency.type === DependencyType.field &&
        (action as SetContactField).field.key === dependency.key
      );
    });
  } else if (
    action.type === Types.add_contact_groups ||
    action.type === Types.remove_contact_groups
  ) {
    return dependencies.filter((dependency: Dependency) => {
      return (
        dependency.type === DependencyType.group &&
        (action as ChangeGroups).groups.find((group: Group) => group.uuid === dependency.uuid)
      );
    });
  } else if (action.type === Types.set_contact_channel) {
    return dependencies.filter((dependency: Dependency) => {
      return (
        dependency.type === DependencyType.channel &&
        (action as SetContactChannel).channel.uuid === dependency.uuid
      );
    });
  }
  return [];
};
