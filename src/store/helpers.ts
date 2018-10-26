import { fieldToAsset } from '~/components/flow/actions/updatecontact/helpers';
import { DefaultExitNames } from '~/components/flow/routers/constants';
import { Types } from '~/config/typeConfigs';
import {
    AddLabels,
    AnyAction,
    ChangeGroups,
    Exit,
    FlowDefinition,
    FlowNode,
    FlowPosition,
    RouterTypes,
    SetContactField,
    SetRunResult,
    SwitchRouter,
    UIMetaData,
    WaitTypes
} from '~/flowTypes';
import Localization, { LocalizedObject } from '~/services/Localization';
import { Asset, AssetMap, AssetType, RenderNode, RenderNodeMap } from '~/store/flowContext';
import { createUUID, snakify } from '~/utils';

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
    }

    // Account for localized exits
    node.exits.forEach(exit => {
        if (exit.name) {
            localizations.push(Localization.translate(exit, language, translations));
        }
    });

    return localizations;
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

export const getCurrentDefinition = (
    definition: FlowDefinition,
    nodeMap: RenderNodeMap,
    includeUI: boolean = true
): FlowDefinition => {
    const renderNodes = getOrderedNodes(nodeMap);
    const nodes: FlowNode[] = [];
    renderNodes.map((renderNode: RenderNode) => {
        nodes.push(renderNode.node);
    });

    // tslint:disable-next-line:variable-name
    const uiNodes = {};
    for (const uuid of Object.keys(nodeMap)) {
        uiNodes[uuid] = nodeMap[uuid].ui;
    }

    // tslint:disable-next-line:variable-name
    const _ui: UIMetaData = {
        nodes: uiNodes,
        stickies: definition._ui.stickies,
        languages: definition._ui.languages
    };

    return {
        ...definition,
        nodes,
        _ui
    };
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
): { [uuid: string]: FlowPosition } => {
    const collisions = {};
    for (const nodeUUID of Object.keys(nodes)) {
        const node = nodes[nodeUUID];
        if (collides(box, node.ui.position)) {
            collisions[node.node.uuid] = node.ui.position;
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

export const getGhostNode = (
    fromNode: RenderNode,
    fromExitUUID: string,
    suggestedResultNameCount: number
): RenderNode => {
    const ghostNode: FlowNode = {
        uuid: createUUID(),
        actions: [],
        exits: [
            {
                uuid: createUUID(),
                destination_node_uuid: null
            }
        ]
    };

    let type = Types.execute_actions;

    // Add an action if we are coming from a split
    if (fromNode.node.wait || fromNode.ui.type === Types.split_by_webhook) {
        const replyAction = {
            uuid: createUUID(),
            type: Types.send_msg,
            text: ''
        };

        ghostNode.actions.push(replyAction);
    } else {
        // Otherwise we are going to a switch
        ghostNode.exits[0].name = DefaultExitNames.All_Responses;
        ghostNode.wait = { type: WaitTypes.msg };
        ghostNode.router = {
            type: RouterTypes.switch,
            result_name: getSuggestedResultName(suggestedResultNameCount)
        };
        type = Types.wait_for_response;
    }

    return {
        node: ghostNode,
        ui: { position: { left: 0, top: 0 }, type },
        inboundConnections: { [fromExitUUID]: fromNode.node.uuid },
        ghost: true
    };
};

export interface FlowComponents {
    renderNodeMap: RenderNodeMap;
    groups: AssetMap;
    fields: AssetMap;
    labels: AssetMap;
    results: AssetMap;
}

export const isGroupAction = (actionType: string) => {
    return (
        actionType === Types.add_contact_groups ||
        actionType === Types.remove_contact_groups ||
        actionType === Types.send_broadcast
    );
};

export const generateResultQuery = (resultName: string) => `@run.results.${snakify(resultName)}`;

/**
 * Converts a list of assets to a map keyed by their id
 */
export const assetListToMap = (assets: Asset[]): AssetMap => {
    const assetMap = {};
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
export const getFlowComponents = ({ nodes, _ui }: FlowDefinition): FlowComponents => {
    const renderNodeMap: RenderNodeMap = {};

    // initialize our nodes
    const pointerMap: { [uuid: string]: { [uuid: string]: string } } = {};

    const groups: AssetMap = {};
    const fields: AssetMap = {};
    const labels: AssetMap = {};
    const results: AssetMap = {};

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

        if (node.router) {
            if (node.router.result_name) {
                const key = snakify(node.router.result_name);
                results[key] = {
                    name: node.router.result_name,
                    id: key,
                    type: AssetType.Result
                };
            }
        }

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
                    groups[groupUUID] = {
                        name: exit.name,
                        id: groupUUID,
                        type: AssetType.Group
                    };
                }
            }
        }

        for (const action of node.actions) {
            if (isGroupAction(action.type)) {
                for (const group of (action as ChangeGroups).groups) {
                    groups[group.uuid] = {
                        name: group.name,
                        id: group.uuid,
                        type: AssetType.Group
                    };
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
                fields[key] = {
                    name: resultAction.name,
                    id: key,
                    type: AssetType.Result
                };
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

    return { renderNodeMap, groups, fields, labels, results };
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
