const mutate = require('immutability-helper');
import { Node, UINode, AnyAction, FlowDefinition, Dimensions } from '../flowTypes';
import { v4 as generateUUID } from 'uuid';
import { RenderNode, RenderNodeMap } from './flowContext';
import { dump } from '../utils';
import { getUniqueDestinations } from './helpers';
import { LocalizationUpdates } from '.';

export const uniquifyNode = (newNode: Node): Node => {
    // Give our node a unique uuid
    return mutate(newNode, { $merge: { uuid: generateUUID() } });
};

/**
 * Update the destination for a specific exit. Updates destination_node_uuid and
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
    destination: string
): RenderNodeMap => {
    let updatedNodes = nodes;

    const fromNode = nodes[fromNodeUUID];
    let previousDestination: string;

    for (const [exitIdx, exit] of fromNode.node.exits.entries()) {
        if (exit.uuid === fromExitUUID) {
            previousDestination = exit.destination_node_uuid;
            updatedNodes = mutate(updatedNodes, {
                [fromNodeUUID]: {
                    node: { exits: { [exitIdx]: { destination_node_uuid: { $set: destination } } } }
                }
            });
        }
    }

    // update our pointers
    if (destination) {
        updatedNodes = mutate(updatedNodes, {
            [destination]: { inboundConnections: { $merge: { [fromExitUUID]: fromNodeUUID } } }
        });
    } else if (previousDestination) {
        updatedNodes = mutate(updatedNodes, {
            [previousDestination]: { inboundConnections: { $unset: [[fromExitUUID]] } }
        });
    }

    return updatedNodes;
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
 * Adds a given RenderNode to our node map. Updates destinations for any inboundConnections provided and
 * updates inboundConnections for any destination_node_uuid our exits point to.
 * @param nodes
 * @param nodeToAdd the node to add, unique uuid is assumed
 */
export const addNode = (nodes: RenderNodeMap, nodeToAdd: RenderNode): RenderNodeMap => {
    let updatedNodes = mutate(nodes, { $merge: { [nodeToAdd.node.uuid]: nodeToAdd } });

    // if we have inbound connections, update our nodes accordingly
    if (nodeToAdd.inboundConnections) {
        for (const fromExitUUID of Object.keys(nodeToAdd.inboundConnections)) {
            const fromNodeUUID = nodeToAdd.inboundConnections[fromExitUUID];
            for (const [exitIdx, exit] of nodes[fromNodeUUID].node.exits.entries()) {
                // this will only record the last exit for each node, of which
                // there should only ever be one with our drag to add interface
                if (exit.uuid === fromExitUUID) {
                    updatedNodes = mutate(updatedNodes, {
                        [fromNodeUUID]: {
                            node: {
                                exits: {
                                    [exitIdx]: {
                                        $merge: { destination_node_uuid: nodeToAdd.node.uuid }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
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
): RenderNodeMap => mutate(nodes, { [nodeUUID]: { node: { actions: { $push: [action] } } } });

/**
 * Updates the given action in place by it's uuid
 * @param nodes
 * @param nodeUUID
 * @param action
 */
export const updateAction = (nodes: RenderNodeMap, nodeUUID: string, action: AnyAction) => {
    const nodeToEdit = nodes[nodeUUID];

    let updatedNodes = nodes;
    // if we have existing actions, find our action and update it
    if (nodeToEdit.node.actions && nodeToEdit.node.actions.length > 0) {
        for (const [actionIdx, a] of nodeToEdit.node.actions.entries()) {
            if (a.uuid === action.uuid) {
                updatedNodes = mutate(updatedNodes, {
                    [nodeToEdit.node.uuid]: {
                        node: {
                            actions: { [actionIdx]: { $set: action } }
                        }
                    }
                });
            }
        }
    } else if (nodeToEdit.node.actions.length === 0) {
        // we don't have any actions, set our action as the only one
        updatedNodes = mutate(updatedNodes, {
            [nodeToEdit.node.uuid]: {
                node: { actions: { $set: [action] } }
            }
        });
    }

    // TODO: not sure the purpose of this
    let previousDestination = null;
    let previousUUID = generateUUID();
    if (nodeToEdit.node.exits.length === 1) {
        previousDestination = nodeToEdit.node.exits[0].destination_node_uuid;
        previousUUID = nodeToEdit.node.exits[0].uuid;
    }

    // make sure we don't have any routerness left
    updatedNodes = mutate(updatedNodes, {
        [nodeToEdit.node.uuid]: {
            node: {
                $unset: ['router', 'wait'],
                exits: {
                    $set: [
                        {
                            name: null,
                            uuid: previousUUID,
                            destination_node_uuid: previousDestination
                        }
                    ]
                }
            },
            ui: {
                $unset: ['type']
            }
        }
    });

    return updatedNodes;
};

/** Removes a specific action from a node */
export const removeAction = (nodes: RenderNodeMap, node: Node, action: AnyAction) => {
    for (const actionIdx in node.actions) {
        if (node.actions[actionIdx].uuid === action.uuid) {
            return mutate(nodes, {
                [node.uuid]: { node: { actions: { $splcie: [[actionIdx, 1]] } } }
            });
        }
    }
};

/**
 * Moves a single action up in the list for the given node
 * @param nodes
 * @param nodeUUID
 * @param action
 */
export const moveActionUp = (nodes: RenderNodeMap, nodeUUID: string, action: AnyAction) => {
    const renderNode = nodes[nodeUUID];
    const actions = renderNode.node.actions;
    for (const idx in actions) {
        if (actions[idx].uuid === action.uuid) {
            const actionIdx = parseInt(idx, 10);
            const actionAbove = actions[actionIdx - 1];
            return mutate(nodes, {
                [nodeUUID]: {
                    node: { actions: { $splice: [[actionIdx - 1, 2, action, actionAbove]] } }
                }
            });
        }
    }
    return nodes;
};

/**
 * Update a given node given a deifinition and type
 * @param nodes
 * @param node
 * @param type
 */
export const updateNode = (nodes: RenderNodeMap, node: Node, type: string) =>
    mutate(nodes, {
        [node.uuid]: { node: { $set: node }, ui: { $merge: { type } } }
    });

/**
 * Removes a given node from our node map. Updates destinations for any exits that point to us
 * and removes any inboundConnections that reference our exits. Also will reroute connections
 * that route through us.
 * @param nodes
 * @param nodeToRemove
 */
export const removeNode = (nodes: RenderNodeMap, nodeUUID: string): RenderNodeMap => {
    const nodeToRemove = nodes[nodeUUID];

    let updatedNodes = nodes;
    // remove us from any inbound connections
    for (const exit of nodeToRemove.node.exits) {
        if (exit.destination_node_uuid) {
            updatedNodes = mutate(updatedNodes, {
                [exit.destination_node_uuid]: {
                    inboundConnections: { $unset: [exit.uuid] }
                }
            });
        }
    }

    // clear any destinations that point to us
    if (nodeToRemove.inboundConnections) {
        // if we have a single destination, reroute those pointing to us
        let destination = null;
        if (nodeToRemove.node.exits.length === 1) {
            ({ destination_node_uuid: destination } = nodeToRemove.node.exits[0]);
        }

        for (const fromExitUUID of Object.keys(nodeToRemove.inboundConnections)) {
            const fromNodeUUID = nodeToRemove.inboundConnections[fromExitUUID];
            const fromNode = nodes[fromNodeUUID];

            // TODO: this can be optimized to only go through any node's exits once
            for (const [exitIdx, exit] of fromNode.node.exits.entries()) {
                if (exit.uuid === fromExitUUID) {
                    updatedNodes = mutate(updatedNodes, {
                        [fromNodeUUID]: {
                            node: {
                                exits: {
                                    [exitIdx]: { destination_node_uuid: { $set: destination } }
                                }
                            }
                        }
                    });

                    // if we are setting a new destination, update the inboundConnections
                    if (destination) {
                        updatedNodes = mutate(updatedNodes, {
                            [destination]: {
                                inboundConnections: { $merge: { [fromExitUUID]: fromNodeUUID } }
                            }
                        });
                    }
                }
            }
        }
    }

    // remove the actual node
    return mutate(updatedNodes, { $unset: [nodeUUID] });
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
    x: number,
    y: number
): RenderNodeMap => mutate(nodes, { [nodeUUID]: { ui: { position: { $set: { x, y } } } } });

/**
 * Update the dimensions for a specific node
 * @param nodes
 * @param nodeUUID
 * @param dimensions
 */
export const updateDimensions = (
    nodes: RenderNodeMap,
    nodeUUID: string,
    dimensions: Dimensions
): RenderNodeMap => mutate(nodes, { [nodeUUID]: { ui: { $merge: dimensions } } });

/**
 * Prunes the definition for editing, removing node references
 * @param definition our full definition
 */
export const pruneDefinition = (definition: FlowDefinition): FlowDefinition =>
    mutate(definition, { $merge: { nodes: [] }, _ui: { $merge: { nodes: [] } } });

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

    // Initialize localization map if not present on definition
    if (!newDef.localization) {
        newDef = mutate(newDef, {
            localization: {
                $set: {}
            }
        });
    }

    // Add language to localization map if not present
    if (!newDef.localization[language]) {
        newDef = mutate(newDef, {
            localization: {
                [language]: {
                    $set: {}
                }
            }
        });
    }

    // Apply changes
    changes.forEach(({ translations, uuid }) => {
        if (translations) {
            newDef = mutate(newDef, {
                localization: { [language]: { [uuid]: { $set: translations } } }
            });
        } else {
            newDef = mutate(newDef, {
                localization: { [language]: { $unset: [uuid] } }
            });
        }
    });

    return newDef;
};
