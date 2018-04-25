import { v4 as generateUUID } from 'uuid';
import { Types } from '../config/typeConfigs';
import {
    AnyAction,
    FlowDefinition,
    FlowNode,
    FlowPosition,
    Languages,
    SwitchRouter,
    WaitTypes,
    ChangeGroups,
    SetContactField,
    Exit
} from '../flowTypes';
import Localization, { LocalizedObject } from '../services/Localization';
import { RenderNode, RenderNodeMap, SearchResult } from './flowContext';
import { BoolMap } from '../utils';
import SetContactAttribForm from '../component/actions/SetContactAttrib/SetContactAttribForm';

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

/**
 * Gets a suggested result name based on the current number of waits
 * in the current definition
 */
export const getSuggestedResultName = (nodes: RenderNodeMap) => {
    return 'Response ' + (Object.keys(nodes).length + 1);
};

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
        node.exits.forEach(exit => {
            localizations.push(Localization.translate(exit, iso, languages, translations));
        });
    }

    if (action) {
        localizations.push(Localization.translate(action, iso, languages, translations));
    }

    return localizations;
};

export const determineConfigType = (
    nodeToEdit: FlowNode,
    action: AnyAction,
    nodes: RenderNodeMap
) => {
    if (action && action.type) {
        return action.type;
    } else if (nodeToEdit.actions && nodeToEdit.actions.length > 0) {
        return nodeToEdit.actions[nodeToEdit.actions.length - 1].type;
    } else {
        try {
            const renderNode = getNode(nodes, nodeToEdit.uuid);
            /* istanbul ignore else */
            if (renderNode.ui.type) {
                return renderNode.ui.type;
            }
            // tslint:disable-next-line:no-empty
        } catch (Error) {}
    }

    // Account for ghost nodes
    if (nodeToEdit.router) {
        return nodeToEdit.router.type;
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
    box: FlowPosition
): { [uuid: string]: boolean } => {
    const collisions = {};
    for (const nodeUUID of Object.keys(nodes)) {
        const node = nodes[nodeUUID];
        if (collides(box, node.ui.position)) {
            collisions[node.node.uuid] = true;
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
            type: Types.send_msg,
            text: ''
        };

        ghostNode.actions.push(replyAction);
    } else {
        // Otherwise we are going to a switch
        ghostNode.exits[0].name = 'All Responses';
        ghostNode.wait = { type: WaitTypes.msg };
        ghostNode.router = {
            type: 'switch',
            result_name: getSuggestedResultName(nodes)
        };
    }

    return ghostNode;
};

export interface FlowComponents {
    renderNodeMap: RenderNodeMap;
    groups: SearchResult[];
    fields: SearchResult[];
}

export const isGroupAction = (actionType: string) => {
    return actionType === 'add_contact_groups' || actionType === 'remove_contact_groups';
};

/**
 * Processes an initial FlowDefinition for details necessary for the editor
 */
export const getFlowComponents = ({ nodes, _ui }: FlowDefinition): FlowComponents => {
    const renderNodeMap: RenderNodeMap = {};

    // our groups and fields referenced within
    const groups: SearchResult[] = [];
    const fields: SearchResult[] = [];

    // initialize our nodes
    const pointerMap: { [uuid: string]: { [uuid: string]: string } } = {};

    const groupsMap: { [uuid: string]: string } = {};
    const fieldsMap: { [key: string]: { key: string; name: string } } = {};

    for (const node of nodes) {
        if (!node.actions) {
            node.actions = [];
        }

        const ui = _ui.nodes[node.uuid];
        renderNodeMap[node.uuid] = {
            node,
            ui,
            inboundConnections: {}
        };

        // if we are split by group, look at our exits for groups
        if (ui.type === Types.split_by_groups) {
            const router = node.router as SwitchRouter;
            for (const kase of router.cases) {
                const groupUUID = kase.arguments[0];
                const exit = node.exits.find((groupExit: Exit) => {
                    return groupExit.uuid === kase.exit_uuid;
                });

                /* istanbul ignore else */
                if (exit) {
                    groupsMap[groupUUID] = exit.name;
                }
            }
        }

        for (const action of node.actions) {
            if (isGroupAction(action.type)) {
                for (const group of (action as ChangeGroups).groups) {
                    groupsMap[group.uuid] = group.name;
                }
            } else if (action.type === 'set_contact_field') {
                const fieldAction = action as SetContactField;
                fieldsMap[fieldAction.field.key] = fieldAction.field;
            }
        }

        for (const exit of node.exits) {
            if (exit.destination_node_uuid) {
                let pointers: { [uuid: string]: string } = pointerMap[exit.destination_node_uuid];

                if (!pointers) {
                    pointers = {};
                }

                pointers[exit.uuid] = node.uuid;
                pointerMap[exit.destination_node_uuid] = pointers;
            }
        }
    }

    // store our pointers with their associated nodes
    for (const nodeUUID of Object.keys(pointerMap)) {
        renderNodeMap[nodeUUID].inboundConnections = pointerMap[nodeUUID];
    }

    for (const uuid of Object.keys(groupsMap)) {
        groups.push({ name: groupsMap[uuid], id: uuid, type: 'group' });
    }

    for (const key of Object.keys(fieldsMap)) {
        fields.push({ name: fieldsMap[key].name, id: key, type: 'field' });
    }

    return { renderNodeMap, groups, fields };
};
