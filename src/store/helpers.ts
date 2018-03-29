import { v4 as generateUUID } from 'uuid';
import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import {
    AnyAction,
    FlowDefinition,
    Languages,
    Node,
    SwitchRouter,
    UIMetaData,
    UINode,
    WaitType
} from '../flowTypes';
import Localization, { LocalizedObject } from '../services/Localization';
import { SearchResult, RenderNode } from './flowContext';
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
    { uuid: nodeUUID }: Node,
    nodes: { [uuid: string]: RenderNode }
): Node[] => {
    const below = nodes[nodeUUID].ui.position.y;

    // TODO: well this isn't great now is it
    // good news though, I don't think we need this
    // if we do group drag selection
    const nodesBelow = [];
    for (const uuid in Object.keys(nodes)) {
        if (uuid !== nodeUUID) {
            const belowNode = nodes[uuid];
            if (belowNode.ui.position.y > below) {
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
export const getSuggestedResultName = (nodes: { [uuid: string]: RenderNode }) => {
    return 'Response ' + nodes.length;
};

export const getNodeUI = (uuid: string, definition: FlowDefinition) => definition._ui.nodes[uuid];

export const collides = (a: Bounds, b: Bounds) =>
    a.bottom < b.top || a.top > b.bottom || a.left > b.right || a.right < b.left ? false : true;

/**
 * Computes translations prop for `Node` components in render()
 */
export const getTranslations = (definition: FlowDefinition, language: Language) => {
    if (definition.localization) {
        return definition.localization[language.iso];
    }
    return null;
};

export const getLocalizations = (
    node: Node,
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
    nodeToEdit: Node,
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

export const getUniqueDestinations = (node: Node): string[] => {
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

export const nodeSort = (definition: FlowDefinition) => (a: Node, b: Node) => {
    const { position: aPos } = definition._ui.nodes[a.uuid];
    const { position: bPos } = definition._ui.nodes[b.uuid];
    const diff = aPos.y - bPos.y;
    // Secondary sort on X location
    if (diff === 0) {
        return aPos.x - bPos.x;
    }
    return diff;
};

export const getNodeBoundaries = (nodes: { [uuid: string]: RenderNode }) =>
    Object.keys(nodes)
        .reduce((uiList, nodeUUID) => {
            const renderNode = nodes[nodeUUID];
            const uiDetails = renderNode.ui;

            // This should only happen with freshly added nodes, since
            // they don't have dimensions until they are rendered.
            const dimensions = uiDetails.dimensions
                ? uiDetails.dimensions
                : { width: 250, height: 100 };

            uiList.push({
                uuid: renderNode.node.uuid,
                bounds: {
                    left: uiDetails.position.x,
                    top: uiDetails.position.y,
                    right: uiDetails.position.x + dimensions.width,
                    bottom: uiDetails.position.y + dimensions.height
                }
            });

            return uiList;
        }, [])
        .sort((a: any, b: any) => {
            let diff = a.bounds.top - b.bounds.top;
            if (diff === 0) {
                diff = a.bounds.left - b.bounds.left;
            }
            return diff;
        });

export const getCollisions = (nodes: { [uuid: string]: RenderNode }, nodeSpacing: number) => {
    const boundaries = getNodeBoundaries(nodes);
    const updatedNodes: Reflow[] = [];

    for (let i = 0; i < boundaries.length; i++) {
        const current = boundaries[i];

        if (!current.bounds) {
            throw new Error(`Dimensions missing for ${current.uuid}`);
        }

        for (let j = i + 1; j < boundaries.length; j++) {
            const other = boundaries[j];

            if (collides(current.bounds, other.bounds)) {
                // console.log("COLLISON:", current, other);
                let diff = current.bounds.bottom - other.bounds.top + nodeSpacing;
                diff += 20 - diff % 20;

                other.bounds.top += diff;
                other.bounds.bottom += diff;
                updatedNodes.push(other);

                // See if our collision cascades
                if (boundaries.length > j + 1) {
                    const next = boundaries[j + 1];
                    // If so, push everybody else down
                    for (let k = j + 1; k < boundaries.length; k++) {
                        const below = boundaries[k];
                        below.bounds.top += diff;
                        below.bounds.bottom += diff;
                        updatedNodes.push(below);
                    }
                }

                return updatedNodes;
            } else if (other.bounds.top > current.bounds.bottom) {
                // If they start below our lowest point, move on
                continue;
            }
        }
    }

    return updatedNodes;
};

export const getGhostNode = (fromNode: RenderNode, nodes: { [uuid: string]: RenderNode }) => {
    const ghostNode: Node = {
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
