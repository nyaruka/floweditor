import { v4 as generateUUID } from 'uuid';
import { DragPoint } from '../component/Node';
import {
    AnyAction,
    FlowDefinition,
    Languages,
    LocalizationMap,
    FlowNode,
    SwitchRouter,
    WaitType
} from '../flowTypes';
import Localization, { LocalizedObject } from '../services/Localization';
import { RenderNode, RenderNodeMap, SearchResult } from './flowContext';
import { PendingConnections } from './flowEditor';

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

export const getExistingGroups = (groups: { [id: string]: SearchResult }) =>
    Object.keys(groups).reduce((groupsList, groupKey) => {
        if (groups.hasOwnProperty(groupKey)) {
            groupsList.push(groups[groupKey]);
        }
        return groupsList;
    }, []);

export const getExistingResultNames = (resultNames: { [name: string]: string }) =>
    Object.keys(resultNames).reduce((resultNameList, resultNameKey) => {
        if (resultNameKey && resultNameKey.trim().length > 0) {
            resultNameList.push(
                {
                    name: `run.results.${resultNameKey}`,
                    description: `Result for "${resultNames[resultNameKey]}"`
                },
                {
                    name: `run.results.${resultNameKey}.category`,
                    description: `Category for "${resultNames[resultNameKey]}"`
                }
            );
        }
        return resultNameList;
    }, []);

export const getExistingFields = (
    reservedFields: SearchResult[],
    fields: { [id: string]: SearchResult }
) =>
    Object.keys(fields).reduce((existingFields, fieldKey) => {
        existingFields.push(fields[fieldKey]);
        return existingFields;
    }, reservedFields);

export const pureSort = (list: any[], fn: (a: any, b: any) => number) => [...list].sort(fn);

export const getNodesBelow = (
    { uuid: nodeUUID }: FlowNode,
    nodes: { [uuid: string]: RenderNode }
): FlowNode[] => {
    const below = nodes[nodeUUID].ui.position.top;

    // TODO: well this isn't great now is it
    // good news though, I don't think we need this
    // if we do group drag selection
    const nodesBelow = [];
    for (const uuid in Object.keys(nodes)) {
        if (uuid !== nodeUUID) {
            const belowNode = nodes[uuid];
            if (belowNode.ui.position.top > below) {
                nodesBelow.push(belowNode.node);
            }
        }
    }
    return nodesBelow;
};

export const getPendingConnection = (
    nodeUUID: string,
    pendingConnections: PendingConnections
): DragPoint => pendingConnections[nodeUUID];

/**
 * Gets a suggested result name based on the current number of waits
 * in the current definition
 */
export const getSuggestedResultName = (nodes: RenderNodeMap) => {
    return 'Response ' + (Object.keys(nodes).length + 1);
};

export const getNodeUI = (uuid: string, definition: FlowDefinition) => definition._ui.nodes[uuid];

/**
 * Computes translations prop for `Node` components in render()
 */
export const getTranslations = (localizationMap: LocalizationMap, iso: string) =>
    localizationMap[iso];

export const getLocalizations = (
    node: FlowNode,
    action: AnyAction,
    iso: string,
    languages: Languages,
    translations?: { [uuid: string]: any }
): LocalizedObject[] => {
    const localizations: LocalizedObject[] = [];

    // Account for localized cases
    if (node.router && node.router.type === 'switch') {
        const router = node.router as SwitchRouter;

        router.cases.forEach(kase =>
            localizations.push(Localization.translate(kase, iso, languages, translations))
        );

        // Account for localized exits
        if (node.exits) {
            node.exits.forEach(exit => {
                localizations.push(Localization.translate(exit, iso, languages, translations));
            });
        }
    }

    if (action) {
        localizations.push(Localization.translate(action, iso, languages, translations));
    }

    return localizations;
};

export const determineConfigType = (
    nodeToEdit: FlowNode,
    action: AnyAction,
    nodes: { [uuid: string]: RenderNode }
) => {
    if (action && action.type) {
        return action.type;
    } else if (nodeToEdit.actions && nodeToEdit.actions.length) {
        return nodeToEdit.actions[nodeToEdit.actions.length - 1].type;
    } else {
        const renderNode = nodes[nodeToEdit.uuid];
        if (renderNode) {
            if (renderNode.ui.type) {
                return renderNode.ui.type;
            }
        }
    }

    // Account for ghost nodes
    if (nodeToEdit) {
        if (nodeToEdit.router) {
            return nodeToEdit.router.type;
        }

        if (nodeToEdit.actions) {
            return nodeToEdit.actions[0].type;
        }
    }

    throw new Error(`Cannot initialize NodeEditor without a valid type: ${nodeToEdit.uuid}`);
};

export const getUniqueDestinations = (node: FlowNode): string[] => {
    const destinations = {};
    for (const exit of node.exits) {
        if (exit.destination_node_uuid) {
            destinations[exit.destination_node_uuid] = true;
        }
    }
    return Object.keys(destinations);
};

export const getConnectionError = (source: string, targetUUID: string) => {
    const [nodeUUID, exitUUID] = source.split(':');
    return nodeUUID === targetUUID ? 'Connections cannot route back to the same places.' : null;
};

export const nodeSort = (definition: FlowDefinition) => (a: FlowNode, b: FlowNode) => {
    const { position: aPos } = definition._ui.nodes[a.uuid];
    const { position: bPos } = definition._ui.nodes[b.uuid];
    const diff = aPos.top - bPos.top;
    // Secondary sort on X location
    if (diff === 0) {
        return aPos.left - bPos.left;
    }
    return diff;
};

const getOrderedNodes = (nodes: RenderNodeMap): RenderNode[] => {
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

export const collides = (a: RenderNode, b: RenderNode) => {
    const aPos = a.ui.position;
    const bPos = b.ui.position;

    // don't bother with collision if we don't have full dimensions
    if (!aPos.bottom || !bPos.bottom) {
        return false;
    }

    return !(
        bPos.left > aPos.right ||
        bPos.right < aPos.left ||
        bPos.top > aPos.bottom ||
        bPos.bottom < aPos.top
    );
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
                if (collides(current, other)) {
                    // if the next node collides too, include it
                    // to deal with inserting between two closely
                    // positioned nodes
                    if (j + 1 < sortedNodes.length) {
                        const cascaded = sortedNodes[j + 1];
                        if (collides(other, cascaded)) {
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

export const getGhostNode = (fromNode: RenderNode, nodes: RenderNodeMap) => {
    const ghostNode: FlowNode = {
        uuid: generateUUID(),
        actions: [],
        exits: [
            {
                uuid: generateUUID(),
                destination_node_uuid: null
            }
        ]
    };

    // Add an action if we are coming from a split
    if (fromNode.node.wait || fromNode.ui.type === 'webhook') {
        const replyAction = {
            uuid: generateUUID(),
            type: 'send_msg',
            text: ''
        };

        ghostNode.actions.push(replyAction);
    } else {
        // Otherwise we are going to a switch
        ghostNode.exits[0].name = 'All Responses';
        ghostNode.wait = { type: WaitType.msg };
        ghostNode.router = {
            type: 'switch',
            result_name: getSuggestedResultName(nodes)
        };
    }

    return ghostNode;
};
