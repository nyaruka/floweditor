import { fieldToAsset } from 'components/flow/actions/updatecontact/helpers';
import { getResultName } from 'components/flow/node/helpers';
import { DefaultExitNames } from 'components/flow/routers/constants';
import { getSwitchRouter } from 'components/flow/routers/helpers';
import { GROUPS_OPERAND } from 'components/nodeeditor/constants';
import { FlowTypes, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { getActivity } from 'external';
import {
  AddLabels,
  AnyAction,
  Category,
  ChangeGroups,
  FlowDefinition,
  FlowNode,
  FlowPosition,
  HintTypes,
  RouterTypes,
  SetContactField,
  SetRunResult,
  StickyNote,
  SwitchRouter,
  UIMetaData,
  Wait,
  WaitTypes,
  SendMsg,
  FlowIssue,
  FlowIssueType
} from 'flowTypes';
import Localization, { LocalizedObject } from 'services/Localization';
import { Activity, EditorState, Warnings } from 'store/editor';
import {
  Asset,
  AssetMap,
  AssetType,
  RenderNode,
  RenderNodeMap,
  FlowIssueMap
} from 'store/flowContext';
import { addResult } from 'store/mutators';
import { DispatchWithState, GetState, mergeEditorState } from 'store/thunks';
import { createUUID, snakify } from 'utils';

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Reflow {
  uuid: string;
  bounds: Bounds;
}

// track if we have an active timeout before issuing a new one
let activityTimeout: any = null;

export const getNodeWithAction = (nodes: RenderNodeMap, actionUUID: string): RenderNode => {
  for (const nodeUUID of Object.keys(nodes)) {
    const renderNode = nodes[nodeUUID];
    for (const action of renderNode.node.actions) {
      if (action.uuid === actionUUID) {
        return renderNode;
      }
    }
  }
};

export const getNode = (nodes: RenderNodeMap, nodeUUID: string) => {
  const node = nodes[nodeUUID];
  if (!node) {
    throw new Error('Cannot find node ' + nodeUUID);
  }
  return node;
};

export const getExitIndex = (node: FlowNode, exitUUID: string) => {
  for (const [exitIdx, exit] of node.exits.entries()) {
    if (exit.uuid === exitUUID) {
      return exitIdx;
    }
  }
  throw new Error('Cannot find exit ' + exitUUID);
};

export const getActionIndex = (node: FlowNode, actionUUID: string) => {
  for (const [actionIdx, action] of node.actions.entries()) {
    if (action.uuid === actionUUID) {
      return actionIdx;
    }
  }
  throw new Error('Cannot find action ' + actionUUID);
};

export const getSuggestedResultName = (count: number) => `Result ${count}`;

export const hasRouter = (renderNode: RenderNode): boolean => {
  return !!(renderNode && renderNode.node.router);
};

export const hasWait = (renderNode: RenderNode): boolean => {
  return !!(renderNode.node.router && renderNode.node.router.wait);
};

export const hasLoopSplit = (renderNode: RenderNode): boolean => {
  const type = getType(renderNode);

  return (
    hasWait(renderNode) || type === Types.split_by_expression || type === Types.split_by_subflow
  );
};

/**
 * Follows every path from fromNodeUUID to toNodeUUID and throws
 * an error if we hit ourselves again without hitting a wait
 * @param nodes the entire node map
 * @param fromNodeUUID which node we are originating from
 * @param toNodeUUID where we are trying to go
 * @param path the path we have tried so far
 */
export const detectLoops = (
  nodes: RenderNodeMap,
  fromNodeUUID: string,
  toNodeUUID: string,
  path: string[] = []
): void => {
  const fromNode = nodes[fromNodeUUID];
  const toNode = nodes[toNodeUUID];

  if (fromNodeUUID === toNodeUUID) {
    throw new Error("Flow loop detected, can't point to self");
  }

  if (hasLoopSplit(toNode) || hasLoopSplit(fromNode)) {
    return;
  }

  if (path.length === 0) {
    path.push(fromNodeUUID);
    for (const exit of toNode.node.exits) {
      if (exit.destination_uuid) {
        detectLoops(nodes, toNode.node.uuid, exit.destination_uuid, path);
      }
    }
    return;
  }

  // we're back where we started
  if (toNodeUUID === path[0]) {
    throw new Error('Flow loop detected, route through a wait first');
  }

  // add us to the path
  path.push(toNodeUUID);

  // follow each of our exits
  for (const exit of toNode.node.exits) {
    if (exit.destination_uuid) {
      detectLoops(nodes, toNodeUUID, exit.destination_uuid, path);
    }
  }

  return;
};

export const getLocalizations = (
  node: FlowNode,
  action: AnyAction,
  language: Asset,
  translations?: { [uuid: string]: any }
): LocalizedObject[] => {
  const localizations: LocalizedObject[] = [];

  // Account for localized cases
  if (node.router && node.router.type === RouterTypes.switch) {
    const router = node.router as SwitchRouter;

    router.cases.forEach(kase =>
      localizations.push(Localization.translate(kase, language, translations))
    );
  }

  if (action) {
    localizations.push(Localization.translate(action, language, translations));
    // check for localized template variables]
    if (action.type === Types.send_msg) {
      const sendMsgAction = action as SendMsg;
      if (sendMsgAction.templating) {
        localizations.push(
          Localization.translate(sendMsgAction.templating, language, translations)
        );
      }
    }
  }

  // Account for localized categories
  if (node.router) {
    node.router.categories.forEach(category => {
      if (category.name) {
        localizations.push(Localization.translate(category, language, translations));
      }
    });
  }

  return localizations;
};

export const getUniqueDestinations = (node: FlowNode): string[] => {
  const destinations: any = {};
  for (const exit of node.exits) {
    if (exit.destination_uuid) {
      destinations[exit.destination_uuid] = true;
    }
  }
  return Object.keys(destinations);
};

export const getCurrentDefinition = (
  definition: FlowDefinition,
  nodeMap: RenderNodeMap,
  includeUI: boolean = true
): FlowDefinition => {
  const renderNodes = getOrderedNodes(nodeMap);
  const nodes: FlowNode[] = [];
  renderNodes.forEach((renderNode: RenderNode) => nodes.push(renderNode.node));

  // tslint:disable-next-line:variable-name
  const uiNodes: any = {};
  for (const uuid of Object.keys(nodeMap)) {
    uiNodes[uuid] = nodeMap[uuid].ui;
  }

  const result = {
    ...definition,
    nodes
  };

  if (includeUI) {
    // tslint:disable-next-line:variable-name
    result._ui = {
      nodes: uiNodes,
      stickies: definition._ui.stickies,
      languages: definition._ui.languages,
      translation_filters: definition._ui.translation_filters
    } as UIMetaData;
  }

  return result;
};

export const newPosition = (left: number, top: number): FlowPosition => {
  return { left, top };
};

export const addPosition = (a: FlowPosition, b: FlowPosition): FlowPosition => {
  const width = a.right - a.left;
  const height = a.bottom - a.top;

  // we allow dragging out of bounds
  const top = a.top + b.top;
  const left = a.left + b.left;

  if (width && height) {
    return {
      left,
      top,
      right: left + width,
      bottom: top + height
    };
  }

  return { top, left };
};

export const subtractPosition = (a: FlowPosition, b: FlowPosition): FlowPosition => {
  return { left: a.left - b.left, top: a.top - b.top };
};

export const getOrderedNodes = (nodes: RenderNodeMap): RenderNode[] => {
  const sorted: RenderNode[] = [];
  Object.keys(nodes).forEach((nodeUUID: string) => {
    sorted.push(nodes[nodeUUID]);
  });
  return sorted.sort((a: RenderNode, b: RenderNode) => {
    let diff = a.ui.position.top - b.ui.position.top;
    if (diff === 0) {
      diff = a.ui.position.left - b.ui.position.left;
    }
    return diff;
  });
};

export const getCollisions = (
  nodes: RenderNodeMap,
  stickies: { [key: string]: StickyNote },
  box: FlowPosition
): { [uuid: string]: FlowPosition } => {
  const collisions: any = {};
  for (const nodeUUID of Object.keys(nodes)) {
    const node = nodes[nodeUUID];
    if (collides(box, node.ui.position)) {
      collisions[node.node.uuid] = node.ui.position;
    }
  }

  for (const uuid in stickies) {
    const sticky = stickies[uuid];
    if (collides(box, sticky.position)) {
      collisions[uuid] = sticky.position;
    }
  }

  return collisions;
};

export const collides = (a: FlowPosition, b: FlowPosition) => {
  // don't bother with collision if we don't have full dimensions
  /* istanbul ignore next */
  if (!a.bottom || !b.bottom) {
    return false;
  }

  return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
};

/**
 * Gets the first collsion in the node map returning the original node,
 * the node it collides with and optionally an additional node it
 * collides with if inserting between two nodes
 * @param nodes
 */
export const getCollision = (nodes: RenderNodeMap): RenderNode[] => {
  const sortedNodes = getOrderedNodes(nodes);

  for (let i = 0; i < sortedNodes.length; i++) {
    const current = sortedNodes[i];
    if (i + 1 < sortedNodes.length) {
      for (let j = i + 1; j < sortedNodes.length; j++) {
        const other = sortedNodes[j];
        if (collides(current.ui.position, other.ui.position)) {
          // if the next node collides too, include it
          // to deal with inserting between two closely
          // positioned nodes
          if (j + 1 < sortedNodes.length) {
            const cascaded = sortedNodes[j + 1];
            if (collides(other.ui.position, cascaded.ui.position)) {
              return [current, other, cascaded];
            }
          }
          return [current, other];
        }
      }
    }
  }
  return [];
};

export const createEmptyNode = (
  fromNode: RenderNode,
  fromExitUUID: string,
  suggestedResultNameCount: number,
  flowType: FlowTypes
): RenderNode => {
  const emptyNode: FlowNode = {
    uuid: createUUID(),
    actions: [],
    exits: [
      {
        uuid: createUUID(),
        destination_uuid: null
      }
    ]
  };

  let type = Types.execute_actions;

  // Add an action next if 1) this is first node, 2) we are coming from a router or 3) this is a background flow
  if (!fromNode || hasRouter(fromNode) || flowType === FlowTypes.MESSAGING_BACKGROUND) {
    const replyType = flowType === FlowTypes.VOICE ? Types.say_msg : Types.send_msg;
    const replyAction = {
      uuid: createUUID(),
      text: '',
      type: replyType
    };

    emptyNode.actions.push(replyAction);
  } else {
    // Otherwise we are going to a switch
    const categories: Category[] = [
      {
        uuid: createUUID(),
        name: DefaultExitNames.All_Responses,
        exit_uuid: emptyNode.exits[0].uuid
      }
    ];

    const wait: Wait = { type: WaitTypes.msg };
    type = Types.wait_for_response;
    if (flowType === FlowTypes.VOICE) {
      wait.hint = { type: HintTypes.digits, count: 1 };
    }

    emptyNode.router = {
      type: RouterTypes.switch,
      result_name: getSuggestedResultName(suggestedResultNameCount),
      default_category_uuid: categories[0].uuid,
      categories,
      wait,
      cases: []
    } as SwitchRouter;
  }

  let inboundConnections = {};
  if (fromNode) {
    inboundConnections = { [fromExitUUID]: fromNode.node.uuid };
  }

  return {
    node: emptyNode,
    ui: { position: { left: 0, top: 0 }, type },
    inboundConnections,
    ghost: true
  };
};

export interface FlowComponents {
  renderNodeMap: RenderNodeMap;
  groups: AssetMap;
  fields: AssetMap;
  labels: AssetMap;
  results: AssetMap;
  warnings: Warnings;
}

export const isGroupAction = (actionType: string) => {
  return (
    actionType === Types.add_contact_groups ||
    actionType === Types.remove_contact_groups ||
    actionType === Types.send_broadcast
  );
};

/**
 * This isn't necessarily supported, but lets make a best effort to guess node
 * types from cues within the definition if somebody loads a flow without _ui details.
 * @param node
 */
export const guessNodeType = (node: FlowNode) => {
  // router based nodes
  if (node.router) {
    // hybrid nodes
    if (node.actions.length === 1) {
      if (node.actions[0].type === Types.call_webhook) {
        return Types.split_by_webhook;
      }

      if (node.actions[0].type === Types.transfer_airtime) {
        return Types.split_by_airtime;
      }

      if (node.actions[0].type === Types.call_resthook) {
        return Types.split_by_resthook;
      }

      if (node.actions[0].type === Types.enter_flow) {
        return Types.split_by_subflow;
      }
    }

    if (node.router.wait) {
      return Types.wait_for_response;
    }

    if (node.router.type === RouterTypes.random) {
      return Types.split_by_random;
    }

    const switchRouter = getSwitchRouter(node);
    if (switchRouter) {
      if (switchRouter.operand === GROUPS_OPERAND) {
        return Types.split_by_groups;
      }
    }

    return Types.split_by_expression;
  }

  return Types.execute_actions;
};

export const generateResultQuery = (resultName: string) => `@run.results.${snakify(resultName)}`;

/**
 * Converts a list of assets to a map keyed by their id
 */
export const assetListToMap = (assets: Asset[]): AssetMap => {
  const assetMap: any = {};
  for (const asset of assets) {
    assetMap[asset.id] = asset;
  }
  return assetMap;
};

export const assetMapToList = (assets: AssetMap): any[] => {
  return Object.keys(assets).map(key => {
    const asset = assets[key];
    return { uuid: asset.id, name: asset.name };
  });
};

/**
 * Processes an initial FlowDefinition for details necessary for the editor
 */
export const getFlowComponents = (definition: FlowDefinition): FlowComponents => {
  const renderNodeMap: RenderNodeMap = {};
  const warnings: Warnings = {};
  const { nodes, _ui } = definition;

  // initialize our nodes
  const pointerMap: { [uuid: string]: { [uuid: string]: string } } = {};

  const groups: AssetMap = {};
  const fields: AssetMap = {};
  const labels: AssetMap = {};
  let results: AssetMap = {};

  for (const node of nodes) {
    if (!node.actions) {
      node.actions = [];
    }

    const ui = _ui.nodes[node.uuid];
    const renderNode: RenderNode = {
      node,
      ui,
      inboundConnections: {}
    };

    renderNodeMap[node.uuid] = renderNode;

    const resultName = getResultName(node);
    if (resultName) {
      results = addResult(resultName, results, { nodeUUID: node.uuid });
    }

    const type = getType(renderNode);

    // if we are split by group, look at our categories for groups
    if (type === Types.split_by_groups) {
      const router = getSwitchRouter(node);

      for (const kase of router.cases) {
        const groupUUID = kase.arguments[0];
        const category = router.categories.find((cat: Category) => {
          return cat.uuid === kase.category_uuid;
        });

        /* istanbul ignore else */
        if (category) {
          if (groupUUID) {
            groups[groupUUID] = {
              name: category.name,
              id: groupUUID,
              type: AssetType.Group
            };
          }
        }
      }
    }

    for (const action of node.actions) {
      if (isGroupAction(action.type)) {
        const groupsToChange = (action as ChangeGroups).groups;
        if (groupsToChange) {
          for (const group of groupsToChange) {
            if (group.uuid) {
              groups[group.uuid] = {
                name: group.name,
                id: group.uuid,
                type: AssetType.Group
              };
            }
          }
        }
      } else if (action.type === Types.set_contact_field) {
        const fieldAction = action as SetContactField;
        fields[fieldAction.field.key] = {
          name: fieldAction.field.name,
          id: fieldAction.field.key,
          type: AssetType.Field
        };
      } else if (action.type === Types.add_input_labels) {
        for (const label of (action as AddLabels).labels) {
          labels[label.uuid] = {
            name: label.name,
            id: label.uuid,
            type: AssetType.Label
          };
        }
      } else if (action.type === Types.set_run_result) {
        const resultAction = action as SetRunResult;
        const key = snakify(resultAction.name);

        if (key in results) {
          results[key].references.push({
            nodeUUID: node.uuid,
            actionUUID: action.uuid
          });
        } else {
          results[key] = {
            name: resultAction.name,
            id: key,
            type: AssetType.Result,
            references: [{ nodeUUID: node.uuid, actionUUID: action.uuid }]
          };
        }
      }
    }

    for (const exit of node.exits) {
      if (exit.destination_uuid) {
        let pointers: { [uuid: string]: string } = pointerMap[exit.destination_uuid];

        if (!pointers) {
          pointers = {};
        }

        pointers[exit.uuid] = node.uuid;
        pointerMap[exit.destination_uuid] = pointers;
      }
    }
  }

  // store our pointers with their associated nodes
  for (const nodeUUID of Object.keys(pointerMap)) {
    renderNodeMap[nodeUUID].inboundConnections = pointerMap[nodeUUID];
  }

  return { renderNodeMap, groups, fields, labels, results, warnings };
};

/**
 * Extracts contact fields from a list of nodes
 */
export const extractContactFields = (nodes: FlowNode[]): Asset[] =>
  nodes.reduce((fieldList, { actions }) => {
    actions.forEach(action => {
      if (action.type === Types.set_contact_field) {
        fieldList.push(fieldToAsset((action as SetContactField).field));
      }
    });
    return fieldList;
  }, []);

/** Adds all the items from toAdd if that don't already exist in assets */
export const mergeAssetMaps = (assets: AssetMap, toAdd: AssetMap): void => {
  Object.keys(toAdd).forEach((key: string) => {
    assets[key] = assets[key] || toAdd[key];
  });
};

export const createFlowIssueMap = (
  previousIssues: FlowIssueMap,
  issues: FlowIssue[]
): FlowIssueMap => {
  const issueMap: FlowIssueMap = (issues || [])
    .filter((issue: FlowIssue) => issue.type !== FlowIssueType.LEGACY_EXTRA)
    .reduce((issueMap: FlowIssueMap, issue: FlowIssue) => {
      const nodeIssues: FlowIssue[] = issueMap[issue.node_uuid] || [];
      nodeIssues.push(issue);
      issueMap[issue.node_uuid] = nodeIssues;
      return issueMap;
    }, {});

  for (const [nodeUUID, nodeIssues] of Object.entries(issueMap)) {
    // would be nice not to use stringify as a deepequals here
    if (JSON.stringify(previousIssues[nodeUUID]) === JSON.stringify(nodeIssues)) {
      issueMap[nodeUUID] = previousIssues[nodeUUID];
    }
  }
  return issueMap;
};

export const fetchFlowActivity = (
  endpoint: string,
  dispatch: DispatchWithState,
  getState: GetState,
  uuid: string
): void => {
  const {
    editorState: { simulating, activityInterval, visible }
  } = getState();

  if (visible) {
    getActivity(endpoint, uuid).then((activity: Activity) => {
      // every interval we back off a bit up to 5 minutes
      if (activity) {
        const updates: Partial<EditorState> = {
          liveActivity: activity,
          activityInterval: Math.min(60000 * 5, activityInterval + 200)
        };

        if (!simulating) {
          updates.activity = activity;
        }

        dispatch(mergeEditorState(updates));

        if (activityTimeout) {
          window.clearTimeout(activityTimeout);
        }

        activityTimeout = window.setTimeout(() => {
          fetchFlowActivity(endpoint, dispatch, getState, uuid);
        }, activityInterval);
      }
    });
  } else {
    if (activityTimeout) {
      window.clearTimeout(activityTimeout);
    }

    activityTimeout = window.setTimeout(() => {
      fetchFlowActivity(endpoint, dispatch, getState, uuid);
    }, 1000);
  }
};
