import { getResultName } from 'components/flow/node/helpers';
import { Revision } from 'components/revisions/RevisionExplorer';
import { Types } from 'config/interfaces';
import {
  AnyAction,
  Dimensions,
  FlowDefinition,
  FlowNode,
  FlowPosition,
  RouterTypes,
  StickyNote,
  SwitchRouter
} from 'flowTypes';
import {
  Asset,
  AssetMap,
  AssetStore,
  AssetType,
  Reference,
  RenderNode,
  RenderNodeMap
} from 'store/flowContext';
import { assetListToMap, detectLoops, getActionIndex, getExitIndex, getNode } from 'store/helpers';
import { NodeEditorSettings } from 'store/nodeEditor';
import { LocalizationUpdates } from 'store/thunks';
import { createUUID, merge, push, set, snakify, snapToGrid, splice, unset } from 'utils';

const mutate = require('immutability-helper');

export const uniquifyNode = (newNode: FlowNode): FlowNode => {
  // Give our node a unique uuid
  return mutate(newNode, merge({ uuid: createUUID() }));
};

export const getDefaultExit = (node: FlowNode) => {
  if (node.router.type === RouterTypes.switch) {
    const switchRouter = node.router as SwitchRouter;
    return node.exits.find(exit => exit.uuid === switchRouter.default_category_uuid);
  }
};

export const addAssets = (type: string, store: AssetStore, assets: Asset[]): AssetStore => {
  const assetMap = assetListToMap(assets);
  const updated = mutate(store, {
    [type]: {
      items: {
        $merge: assetMap
      }
    }
  });
  return updated;
};

export const removeResultReference = (
  resultName: string,
  items: AssetMap,
  reference: Reference
): AssetMap => {
  const key = snakify(resultName);

  if (key in items) {
    const item = items[key];
    const filteredRefs = item.references.filter(
      (ref: Reference) =>
        ref.nodeUUID !== reference.nodeUUID || ref.actionUUID !== reference.actionUUID
    );

    if (filteredRefs.length === 0) {
      return mutate(items, { $unset: [key] });
    }

    return mutate(items, { [key]: { references: { $set: filteredRefs } } });
  }
  return items;
};

export const removeResultFromStore = (
  resultName: string,
  assets: AssetStore,
  reference: Reference
): AssetStore => {
  if (resultName && assets.results) {
    const items = removeResultReference(resultName, assets.results.items, reference);
    return mutate(assets, { results: { items: { $set: items } } });
  }
  return assets;
};

export const addResultToStore = (
  resultName: string,
  assets: AssetStore,
  reference: Reference
): AssetStore => {
  if (resultName) {
    const items = addResult(resultName, assets.results.items, reference);
    return mutate(assets, { results: { items: { $set: items } } });
  }
};

export const addResult = (resultName: string, items: AssetMap, reference: Reference): AssetMap => {
  const key = snakify(resultName);
  const result =
    key in items
      ? items[key]
      : {
          name: resultName,
          id: key,
          type: AssetType.Result,
          references: []
        };

  if (
    !result.references.find(
      (ref: Reference) =>
        ref.nodeUUID === reference.nodeUUID && ref.actionUUID === reference.actionUUID
    )
  ) {
    result.references.push(reference);
  }

  return mutate(items, { $merge: { [key]: result } });
};

export const addRevision = (assets: AssetStore, revision: Revision): AssetStore => {
  return mutate(assets, {
    revisions: { items: { $merge: { [revision.id]: revision } } }
  });
};

export const addFlowResult = (assets: AssetStore, node: FlowNode): AssetStore => {
  let updated = assets;

  // TODO: initialize these to empties further up to avoid this
  if (!updated) {
    updated = { results: { items: {}, type: AssetType.Result } };
  }

  if (!updated.results) {
    updated.results = { items: {}, type: AssetType.Result };
  }

  const resultName = getResultName(node);
  if (resultName) {
    const items = addResult(resultName, assets.results.items, {
      nodeUUID: node.uuid
    });
    return mutate(assets, { results: { items: { $set: items } } });
  }

  return assets;
};

/**
 * Update the destination for a specific exit. Updates destination_uuid and
 * the inboundConnections for the given node
 * @param nodes
 * @param fromNodeUUID
 * @param fromExitUUID
 * @param destination
 */
export const updateConnection = (
  nodes: RenderNodeMap,
  fromNodeUUID: string,
  fromExitUUID: string,
  destinationNodeUUID: string
): RenderNodeMap => {
  let updatedNodes = nodes;
  const fromNode = getNode(nodes, fromNodeUUID);

  // make sure our destination exits if they provided one
  if (destinationNodeUUID) {
    getNode(nodes, destinationNodeUUID);
  }

  const exitIdx = getExitIndex(fromNode.node, fromExitUUID);
  const previousDestination = fromNode.node.exits[exitIdx].destination_uuid;

  updatedNodes = mutate(updatedNodes, {
    [fromNodeUUID]: {
      node: {
        exits: {
          [exitIdx]: {
            destination_uuid: set(destinationNodeUUID)
          }
        }
      }
    }
  });

  // update our pointers
  if (destinationNodeUUID) {
    updatedNodes = mutate(updatedNodes, {
      [destinationNodeUUID]: {
        inboundConnections: merge({ [fromExitUUID]: fromNodeUUID })
      }
    });
  }

  if (previousDestination != null) {
    updatedNodes = mutate(updatedNodes, {
      [previousDestination]: { inboundConnections: unset([[fromExitUUID]]) }
    });
  }

  return updatedNodes;
};

export const addLanguage = (languages: Asset[], language: Asset): Asset[] => {
  return mutate(languages, push([language]));
};

/**
 * Removes a spcific destination for an exit and the associated inboundConnection.
 * @param nodes
 * @param fromNodeUUID
 * @param fromExitUUID
 */
export const removeConnection = (
  nodes: RenderNodeMap,
  fromNodeUUID: string,
  fromExitUUID: string
): RenderNodeMap => {
  return updateConnection(nodes, fromNodeUUID, fromExitUUID, null);
};

/**
 * Adds a given RenderNode to our node map or updates an existing one.
 * Updates destinations for any inboundConnections provided and updates
 * inboundConnections for any destination_uuid our exits point to.
 * @param nodes
 * @param node the node to add, if unique uuid, it will be added
 */
export const mergeNode = (nodes: RenderNodeMap, node: RenderNode): RenderNodeMap => {
  let updatedNodes = nodes;

  // if the node is already there, remove it first
  if (updatedNodes[node.node.uuid]) {
    updatedNodes = removeNode(nodes, node.node.uuid);
  }

  // add our node upadted node
  updatedNodes = mutate(nodes, merge({ [node.node.uuid]: node }));

  // if we have inbound connections, update our nodes accordingly
  for (const fromExitUUID of Object.keys(node.inboundConnections)) {
    const fromNodeUUID = node.inboundConnections[fromExitUUID];

    const fromNode = getNode(nodes, fromNodeUUID);
    const exitIdx = getExitIndex(fromNode.node, fromExitUUID);

    updatedNodes = mutate(updatedNodes, {
      [fromNodeUUID]: {
        node: {
          exits: {
            [exitIdx]: merge({ destination_uuid: node.node.uuid })
          }
        }
      }
    });
  }

  return updatedNodes;
};

/**
 * Adds a given action to the provided node
 * @param nodes
 * @param nodeUUID
 * @param action
 */
export const addAction = (
  nodes: RenderNodeMap,
  nodeUUID: string,
  action: AnyAction
): RenderNodeMap => {
  // check that our node exists
  getNode(nodes, nodeUUID);
  return mutate(nodes, { [nodeUUID]: { node: { actions: push([action]) } } });
};

/**
 * Updates the given action in place by it's uuid
 * @param nodes
 * @param nodeUUID
 * @param action
 */
export const updateAction = (
  nodes: RenderNodeMap,
  nodeUUID: string,
  newAction: AnyAction,
  originalAction?: AnyAction
) => {
  const originalNode = getNode(nodes, nodeUUID);
  // If we have existing actions, find our action and update it
  const actionIdx = originalAction ? getActionIndex(originalNode.node, originalAction.uuid) : 0;
  return mutate(nodes, {
    [nodeUUID]: {
      node: {
        actions: { [actionIdx]: set(newAction) }
      }
    }
  });
};

export const spliceInAction = (
  nodes: RenderNodeMap,
  nodeUUID: string,
  action: AnyAction
): RenderNodeMap => {
  const { [nodeUUID]: previousNode } = nodes;

  const otherExit = getDefaultExit(previousNode.node);
  const destination = otherExit ? otherExit.destination_uuid : null;

  // remove our previous node
  let updatedNodes = removeNode(nodes, previousNode.node.uuid, false);

  const newNode: RenderNode = {
    node: {
      uuid: createUUID(),
      actions: [action],
      exits: [{ uuid: createUUID(), destination_uuid: destination }]
    },
    ui: { position: previousNode.ui.position, type: Types.execute_actions },
    inboundConnections: previousNode.inboundConnections
  };

  // add our new node
  updatedNodes = mergeNode(updatedNodes, newNode);

  return updatedNodes;
};

/** Removes a specific action from a node */
export const removeAction = (nodes: RenderNodeMap, nodeUUID: string, actionUUID: string) => {
  const renderNode = getNode(nodes, nodeUUID);
  const actionIdx = getActionIndex(renderNode.node, actionUUID);
  return mutate(nodes, {
    [nodeUUID]: { node: { actions: splice([[actionIdx, 1]]) } }
  });
};

/**
 * Moves a single action up in the list for the given node
 * @param nodes
 * @param nodeUUID
 * @param action
 */
export const moveActionUp = (nodes: RenderNodeMap, nodeUUID: string, actionUUID: string) => {
  const renderNode = getNode(nodes, nodeUUID);

  const actions = renderNode.node.actions;
  const actionIdx = getActionIndex(renderNode.node, actionUUID);

  if (actionIdx === 0) {
    throw new Error('Cannot move an action at the top upwards');
  }

  const action = actions[actionIdx];
  const actionAbove = actions[actionIdx - 1];

  return mutate(nodes, {
    [nodeUUID]: {
      node: { actions: splice([[actionIdx - 1, 2, action, actionAbove]]) }
    }
  });
};

/**
 * Removes a given node from our node map. Updates destinations for any exits that point to us
 * and removes any inboundConnections that reference our exits. Also will reroute connections
 * that route through us.
 * @param nodes
 * @param nodeToRemove
 */
export const removeNode = (
  nodes: RenderNodeMap,
  nodeUUID: string,
  remap: boolean = true
): RenderNodeMap => {
  const nodeToRemove = getNode(nodes, nodeUUID);
  let updatedNodes = nodes;

  // remove us from any inbound connections
  for (const exit of nodeToRemove.node.exits) {
    if (exit.destination_uuid) {
      updatedNodes = mutate(updatedNodes, {
        [exit.destination_uuid]: {
          inboundConnections: unset([exit.uuid])
        }
      });
    }
  }

  // clear any destinations that point to us
  for (const fromExitUUID of Object.keys(nodeToRemove.inboundConnections)) {
    // if we have a single destination, reroute those pointing to us
    let destination = null;
    if (remap && nodeToRemove.node.exits.length === 1) {
      ({ destination_uuid: destination } = nodeToRemove.node.exits[0]);
    }

    const fromNodeUUID = nodeToRemove.inboundConnections[fromExitUUID];
    const fromNode = getNode(nodes, fromNodeUUID);

    // make sure we aren't creating a loop
    if (destination) {
      try {
        detectLoops(updatedNodes, fromNodeUUID, destination);
      } catch {
        destination = null;
      }
    }

    const exitIdx = getExitIndex(fromNode.node, fromExitUUID);
    updatedNodes = mutate(updatedNodes, {
      [fromNodeUUID]: {
        node: {
          exits: {
            [exitIdx]: { destination_uuid: set(destination) }
          }
        }
      }
    });

    // if we are setting a new destination, update the inboundConnections
    if (destination) {
      // make sure our destination exists
      getNode(nodes, destination);
      updatedNodes = mutate(updatedNodes, {
        [destination]: {
          inboundConnections: merge({ [fromExitUUID]: fromNodeUUID })
        }
      });
    }
  }

  // remove the actual node
  return mutate(updatedNodes, unset([nodeUUID]));
};

/**
 * Update the position for a given node
 * @param nodes
 * @param nodeUUID
 * @param x
 * @param y
 */
export const updatePosition = (
  nodes: RenderNodeMap,
  nodeUUID: string,
  position: FlowPosition,
  snap: boolean = true
): RenderNodeMap => {
  const { left, top } = position;

  // make sure we are on the grid
  let adjusted = { left, top };

  if (snap) {
    adjusted = snapToGrid(left, top);
  }

  return mutate(nodes, {
    [nodeUUID]: {
      ui: {
        position: set({
          left: adjusted.left,
          top: adjusted.top
        })
      }
    }
  });
};

export const updateStickyNotePosition = (
  definition: FlowDefinition,
  stickyUUID: string,
  position: FlowPosition,
  snap: boolean = true
): FlowDefinition => {
  if (!definition._ui.stickies) {
    definition._ui.stickies = {};
  }

  const lastPos = definition._ui.stickies[stickyUUID].position;
  const width = lastPos.right - lastPos.left;
  const height = lastPos.bottom - lastPos.top;

  const { left, top } = position;

  // make sure we are on the grid
  let adjusted = { left, top };

  if (snap) {
    adjusted = snapToGrid(left, top);
  }

  return mutate(definition, {
    _ui: {
      stickies: {
        [stickyUUID]: {
          position: set({
            left: adjusted.left,
            top: adjusted.top,
            right: adjusted.left + width,
            bottom: adjusted.top + height
          })
        }
      }
    }
  });
};

/**
 * Update the dimensions for a specific node
 * @param nodes
 * @param nodeUUID
 * @param dimensions
 */
export const updateNodeDimensions = (
  nodes: RenderNodeMap,
  nodeUUID: string,
  dimensions: Dimensions
): RenderNodeMap => {
  const node = getNode(nodes, nodeUUID);
  return mutate(nodes, {
    [nodeUUID]: {
      ui: {
        position: merge({
          bottom: node.ui.position.top + dimensions.height,
          right: node.ui.position.left + dimensions.width
        })
      }
    }
  });
};

/**
 * Update the dimensions for a specific sticky
 * @param definition
 * @param uuuid
 * @param dimensions
 */
export const updateStickyDimensions = (
  definition: FlowDefinition,
  uuid: string,
  dimensions: Dimensions
): FlowDefinition => {
  const position = definition._ui.stickies[uuid].position;
  return mutate(definition, {
    _ui: {
      stickies: {
        [uuid]: {
          position: merge({
            bottom: position.top + dimensions.height,
            right: position.left + dimensions.width
          })
        }
      }
    }
  });
};

export const updateStickyNote = (
  definition: FlowDefinition,
  stickyUUID: string,
  sticky: StickyNote
): FlowDefinition => {
  if (!definition._ui.stickies) {
    definition._ui.stickies = {};
  }
  if (sticky) {
    return mutate(definition, {
      _ui: { stickies: merge({ [stickyUUID]: sticky }) }
    });
  } else {
    return mutate(definition, { _ui: { stickies: unset([stickyUUID]) } });
  }
};

export const mergeNodeEditorSettings = (
  current: NodeEditorSettings,
  newSettings: NodeEditorSettings
) => {
  if (!newSettings) {
    return current;
  }

  if (!current) {
    return newSettings;
  }

  return mutate(current, { $merge: newSettings });
};

/**
 * Prunes the definition for editing, removing node references
 * @param definition our full definition
 */
export const pruneDefinition = (definition: FlowDefinition): FlowDefinition =>
  mutate(definition, { nodes: [], _ui: { $merge: { nodes: {} } } });

/**
 * Update the localization in the definition with the provided changes for a language
 * @param definition
 * @param language
 * @param changes
 */
export const updateLocalization = (
  definition: FlowDefinition,
  language: string,
  changes: LocalizationUpdates
) => {
  let newDef = definition;

  // Add language to localization map if not present
  if (!newDef.localization[language]) {
    newDef = mutate(newDef, {
      localization: {
        [language]: set({})
      }
    });
  }

  // Apply changes
  changes.forEach(({ translations, uuid }) => {
    if (translations) {
      // normalize our translations so all are treated as arrays
      const normalizedTranslations: { [uuid: string]: string[] } = {};
      for (const key of Object.keys(translations)) {
        const prev = translations[key];
        if (Array.isArray(prev)) {
          normalizedTranslations[key] = prev;
        } else {
          normalizedTranslations[key] = [prev];
        }
      }

      // adding localization
      newDef = mutate(newDef, {
        localization: { [language]: { [uuid]: set(normalizedTranslations) } }
      });
    } else {
      // removing localization
      newDef = mutate(newDef, {
        localization: { [language]: unset([uuid]) }
      });
    }
  });

  return newDef;
};
