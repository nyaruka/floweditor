import * as isEqual from 'fast-deep-equal';
import update from 'immutability-helper';
import { Dispatch } from 'react-redux';
import { v4 as generateUUID } from 'uuid';
import { Components } from '.';
import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { hasCases } from '../component/NodeEditor/NodeEditor';
import { getTypeConfig, Type } from '../config';
import { FlowDetails, getFlow, getFlows } from '../external';
import {
    Action,
    AnyAction,
    ChangeGroups,
    Dimensions,
    Exit,
    FlowDefinition,
    Languages,
    Node,
    Position,
    SendMsg,
    SetRunResult,
    SetContactField,
    SwitchRouter,
    UINode
} from '../flowTypes';
import {
    collides,
    determineConfigType,
    getDetails,
    getExit,
    getLocalizations,
    getNode,
    getNodesBelow,
    getNodeUI,
    getPendingConnection,
    getTranslations,
    pureSort,
    snakify
} from '../utils';
import {
    removePendingConnection,
    updateActionToEdit,
    updateComponents,
    updateContactFields,
    updateCreateNodePosition,
    updateDefinition,
    updateDragGroup,
    updateFetchingFlow,
    updateFlows,
    updateFreshestNode,
    updateGhostNode,
    updateGroups,
    updateLanguage,
    updateLocalizations,
    updateNodeDragging,
    updateNodeEditorOpen,
    updateNodes,
    updateNodeToEdit,
    updateOperand,
    updatePendingConnection,
    updatePendingConnections,
    updateResultName,
    updateResultNames,
    updateShowResultName,
    updateTranslating,
    updateTypeConfig,
    updateUserAddingAction,
    updateUserClickingAction,
    updateUserClickingNode
} from './actions';
import {
    CompletionOption,
    ComponentDetails,
    ContactFieldResult,
    ReduxState,
    SearchResult
} from './initialState';
import { LocalizedObject } from '../services/Localization';

export type DispatchWithState = Dispatch<ReduxState>;

export type GetState = () => ReduxState;

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface Reflow {
    uuid: string;
    bounds: Bounds;
}

export interface Connection {
    previousConnection: Connection;
}

export interface ConnectionEvent {
    connection: Connection;
    source: Element;
    target: Element;
    sourceId: string;
    targetId: string;
    suspendedElementId: string;
    endpoints: any[];
}

export type LocalizationUpdates = Array<{ uuid: string; translations?: any }>;

const FORCE_FETCH = true;
const QUIET_UI = 10;
const QUIET_SAVE = 1000;
const NODE_SPACING = 60;

const RESERVED_FIELDS: ContactFieldResult[] = [
    { id: 'name', name: 'Name', type: 'update_contact' }
    // { id: "language", name: "Language", type: "update_contact" }
];

const DEFAULT_OPERAND = '@input';

// let uiTimeout: number;
let reflowTimeout: number;

export const setTranslating = (translating: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (translating !== getState().translating) {
        dispatch(updateTranslating(translating));
    }
};

export const setLanguage = (language: Language) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(language, getState().language)) {
        dispatch(updateLanguage(language));
    }
};

export const setFreshestNode = (freshestNode: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(freshestNode, getState().freshestNode)) {
        dispatch(updateFreshestNode(freshestNode));
    }
};

export const setUserClickingAction = (userClickingAction: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (userClickingAction !== getState().userClickingAction) {
        dispatch(updateUserClickingAction(userClickingAction));
    }
};

export const setNodeDragging = (nodeDragging: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (nodeDragging !== getState().nodeDragging) {
        dispatch(updateNodeDragging(nodeDragging));
    }
};

export const setNodeEditorOpen = (nodeEditorOpen: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (nodeEditorOpen !== getState().nodeEditorOpen) {
        dispatch(updateNodeEditorOpen(nodeEditorOpen));
    }
};

export const setDefinition = (definition: FlowDefinition) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(definition, getState().definition)) {
        dispatch(updateDefinition(definition));
    }
};

export const setDragGroup = (dragGroup: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (dragGroup !== getState().dragGroup) {
        dispatch(updateDragGroup(dragGroup));
    }
};

export const setUserClickingNode = (userClickingNode: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (userClickingNode !== getState().userClickingNode) {
        dispatch(updateUserClickingNode(userClickingNode));
    }
};

export const setShowResultName = (showResultName: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (showResultName !== getState().showResultName) {
        dispatch(updateShowResultName(showResultName));
    }
};

export const setUserAddingAction = (userAddingAction: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (userAddingAction !== getState().userAddingAction) {
        dispatch(updateUserAddingAction(userAddingAction));
    }
};

export const setNodeToEdit = (nodeToEdit: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(nodeToEdit, getState().nodeToEdit)) {
        dispatch(updateNodeToEdit(nodeToEdit));
    }
};

export const setActionToEdit = (actionToEdit: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(actionToEdit, getState().actionToEdit)) {
        dispatch(updateActionToEdit(actionToEdit));
    }
};

export const setLocalizations = (localizations: LocalizedObject[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(localizations, getState().localizations)) {
        dispatch(updateLocalizations(localizations));
    }
};

export const setTypeConfig = (typeConfig: Type) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(typeConfig, getState().typeConfig)) {
        dispatch(updateTypeConfig(typeConfig));
    }
};

export const setContactFields = (contactFields: ContactFieldResult[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(contactFields, getState().contactFields)) {
        dispatch(updateContactFields(contactFields));
    }
};

export const setGroups = (groups: SearchResult[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(groups, getState().groups)) {
        dispatch(updateGroups(groups));
    }
};

export const setComponents = (components: Components) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(components, getState().components)) {
        dispatch(updateComponents(components));
    }
};

export const setResultNames = (resultNames: CompletionOption[]) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!isEqual(resultNames, getState().resultNames)) {
        dispatch(updateResultNames(resultNames));
    }
};

export const setNodes = (nodes: Node[]) => (dispatch: DispatchWithState, getState: GetState) => {
    if (!isEqual(nodes, getState().nodes)) {
        dispatch(updateNodes(nodes));
    }
};

export const fetchFlow = (endpoint: string, uuid: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(updateFetchingFlow(true));
    return getFlow(endpoint, uuid, false)
        .then(({ definition }: FlowDetails) => {
            dispatch(setDefinition(definition));
            dispatch(updateFetchingFlow(false));
        })
        .catch((error: any) => console.log(`fetchFlow error: ${error}`));
};

export const fetchFlows = (endpoint: string) => (dispatch: DispatchWithState) =>
    getFlows(endpoint)
        .then((flows: FlowDetails[]) =>
            dispatch(
                updateFlows(
                    flows.map(({ uuid, name }) => ({
                        uuid,
                        name
                    }))
                )
            )
        )
        .catch((error: any) => console.log(`fetchFlowList error: ${error}`));

export const refresh = (definition: FlowDefinition) => (dispatch: DispatchWithState) => {
    const components: { [uuid: string]: ComponentDetails } = {};
    const exitsWithDestinations: Exit[] = [];
    const fields: { [id: string]: ContactFieldResult } = {};
    const groups: { [id: string]: SearchResult } = {};
    const resultNames: { [name: string]: string } = {};
    let details: ComponentDetails;

    if (!definition) {
        dispatch(updateComponents(components));
        return;
    }

    // determine our indexes
    definition.nodes.forEach((node, nodeIdx) => {
        components[node.uuid] = {
            nodeUUID: node.uuid,
            nodeIdx,
            actionIdx: -1,
            exitIdx: -1,
            pointers: []
        };

        // Set our type
        const ui = definition._ui.nodes[node.uuid];
        if (ui && ui.type) {
            components[node.uuid].type = ui.type;
        }

        // Map out our action idexes
        if (node.actions && node.actions.length) {
            node.actions.forEach((action, actionIdx) => {
                components[action.uuid] = {
                    nodeUUID: node.uuid,
                    nodeIdx,
                    actionUUID: action.uuid,
                    actionIdx,
                    type: action.type
                };

                if (action.type === 'save_flow_result') {
                    const resultProps = action as SetRunResult;
                    resultNames[snakify(resultProps.result_name)] = resultProps.result_name;
                } else if (action.type === 'save_contact_field') {
                    const saveProps = action as SetContactField;
                    if (
                        !RESERVED_FIELDS.some(fieldName => fieldName.name === saveProps.field_name)
                    ) {
                        if (!(saveProps.field_uuid in fields)) {
                            fields[saveProps.field_uuid] = {
                                id: saveProps.field_uuid,
                                name: saveProps.field_name,
                                type: 'field'
                            };
                        }
                    }
                } else if (action.type === 'add_to_group' || action.type === 'remove_from_group') {
                    const groupProps = action as ChangeGroups;
                    for (const group of groupProps.groups) {
                        if (!(group.uuid in groups)) {
                            groups[group.uuid] = {
                                id: group.uuid,
                                name: group.name,
                                type: 'group'
                            };
                        }
                    }
                }
            });
        }

        if (node.router && node.router.result_name) {
            resultNames[snakify(node.router.result_name)] = node.router.result_name;
        }

        // Same for exits
        if (node.exits && node.exits.length) {
            node.exits.forEach((exit, exitIdx) => {
                components[exit.uuid] = {
                    nodeIdx,
                    nodeUUID: node.uuid,
                    exitIdx,
                    exitUUID: exit.uuid
                };

                if (exit.destination_node_uuid) {
                    exitsWithDestinations.push(exit);
                }
            });
        }
    });

    // Add in reverse lookups
    for (const exit of exitsWithDestinations) {
        details = components[exit.destination_node_uuid];
        if (details) {
            details.pointers.push(exit.uuid);
        }
    }

    const existingFields = RESERVED_FIELDS.map(reserved => reserved);
    for (const fieldKey in fields) {
        if (fields.hasOwnProperty(fieldKey)) {
            existingFields.push(fields[fieldKey]);
        }
    }

    const existingGroups = Object.keys(groups).reduce((groupsList, groupKey) => {
        if (groups.hasOwnProperty(groupKey)) {
            groupsList.push(groups[groupKey]);
        }
        return groupsList;
    }, []);

    const existingResultNames = Object.keys(resultNames).reduce((resultNameList, resultNameKey) => {
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

    dispatch(setContactFields(existingFields));
    dispatch(setGroups(existingGroups));
    dispatch(setComponents(components));
    dispatch(setResultNames(existingResultNames));
    dispatch(setNodes(definition.nodes));
};

// export const updateUI = (definition: FlowDefinition) => (dispatch: DispatchWithState) => {
//     if (QUIET_UI > 0) {
//         if (uiTimeout) {
//             window.clearTimeout(uiTimeout);
//         }
//         uiTimeout = window.setTimeout(() => dispatch(setDefinition(definition)));
//     } else {
//         dispatch(setDefinition(definition));
//     }
// };

export const sortNodes = () => (dispatch: DispatchWithState, getState: GetState) => {
    // Find our first node
    let top: Position;
    let topNode: string;

    const nodeSort = (a: Node, b: Node) => {
        const aPos = getState().definition._ui.nodes[a.uuid].position;
        const bPos = getState().definition._ui.nodes[b.uuid].position;
        let diff = aPos.y - bPos.y;
        // Secondary sort on X location
        if (diff === 0) {
            diff = aPos.x - bPos.x;
        }
        return diff;
    };

    const newDef = {
        ...getState().definition,
        nodes: pureSort(getState().definition.nodes, nodeSort)
    };

    for (const nodeUUID in newDef._ui.nodes) {
        if (newDef._ui.nodes.hasOwnProperty(nodeUUID)) {
            const { position } = newDef._ui.nodes[nodeUUID];
            if (top == null || top.y < position.y) {
                top = position;
                topNode = nodeUUID;
            }
        }
    }

    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef))
    dispatch(setDefinition(newDef));
};

export const reflow = () => (dispatch: DispatchWithState, getState: GetState) => {
    console.time('reflow');
    dispatch(sortNodes());

    let newDef = { ...getState().definition };

    const uis = newDef.nodes.reduce((uiList, node) => {
        const LocalizationMap = newDef._ui.nodes[node.uuid];

        // This should only happen with freshly added nodes, since
        // they don't have dimensions until they are rendered.
        const dimensions = LocalizationMap.dimensions
            ? LocalizationMap.dimensions
            : { width: 250, height: 100 };

        uiList.push({
            uuid: node.uuid,
            bounds: {
                left: LocalizationMap.position.x,
                top: LocalizationMap.position.y,
                right: LocalizationMap.position.x + dimensions.width,
                bottom: LocalizationMap.position.y + dimensions.height
            }
        });

        return uiList;
    }, []);

    const updatedNodes: Reflow[] = [];
    for (let i = 0; i < uis.length; i++) {
        const current = uis[i];
        for (let j = i + 1; j < uis.length; j++) {
            const other = uis[j];

            if (!current.bounds) {
                throw new Error(`Dimensions missing for ${current.uuid}`);
            }

            if (collides(current.bounds, other.bounds)) {
                // console.log("COLLISON:", current, other);
                let diff = current.bounds.bottom - other.bounds.top + NODE_SPACING;
                diff += 20 - diff % 20;

                other.bounds.top += diff;
                other.bounds.bottom += diff;

                updatedNodes.push(other);

                // See if our collision cascades
                if (uis.length > j + 1) {
                    const next = uis[j + 1];
                    // If so, push everybody else down
                    for (let k = j + 1; k < uis.length; k++) {
                        const below = uis[k];
                        below.bounds.top += diff;
                        below.bounds.bottom += diff;
                        updatedNodes.push(below);
                    }
                }
                break;
            } else if (other.bounds.top > current.bounds.bottom) {
                // If they start below our lowest point, move on
                break;
            }
        }
    }

    window.setTimeout(() => {
        if (updatedNodes.length > 0) {
            console.log('::REFLOWED::', updatedNodes);
            for (const node of updatedNodes) {
                newDef = update(newDef, {
                    _ui: {
                        nodes: { [node.uuid]: { position: { $merge: { y: node.bounds.top } } } }
                    }
                });
            }
            // dispatch(updateUI(newDef));
            dispatch(setDefinition(newDef));
            console.timeEnd('reflow');
        }
    }, 100);
};

export const markReflow = () => (dispatch: DispatchWithState) => {
    if (QUIET_UI > 0) {
        if (reflowTimeout) {
            window.clearTimeout(reflowTimeout);
        }
        reflowTimeout = window.setTimeout(() => dispatch(reflow()), QUIET_UI);
    } else {
        dispatch(reflow());
    }
};

export const onUpdateLocalizations = (language: string, changes: LocalizationUpdates) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    let newDef = { ...getState().definition };

    // Initialize localization map if not present on definition
    if (!newDef.localization) {
        newDef = update(newDef, {
            localization: {
                $set: {}
            }
        });
    }

    // Add language to localization map if not present
    if (!newDef.localization[language]) {
        newDef = update(newDef, {
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
            newDef = update(newDef, {
                localization: { [language]: { [uuid]: { $set: translations } } }
            });
        } else {
            newDef = update(newDef, {
                localization: { [language]: { $unset: [uuid] } }
            });
        }
    });

    // Update definition
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
};

export const updateNodeUI = (uuid: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const updateNodeUIChanges = { _ui: { nodes: { [uuid]: changes } } };
    const newDef = update(getState().definition, updateNodeUIChanges);
    dispatch(markReflow());
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
};

export const updateDimensions = (node: Node, dimensions: Dimensions) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const ui = getNodeUI(node.uuid, getState().definition);
    if (
        !ui.dimensions ||
        ui.dimensions.height !== dimensions.height ||
        ui.dimensions.width !== dimensions.width
    ) {
        dispatch(updateNodeUI(node.uuid, { $merge: { dimensions } }));
    }
};

export const addNode = (node: Node, ui: UINode, pendingConnection?: DragPoint) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    console.time('addNode');
    let newNode = { ...node };
    let newDef = { ...getState().definition };

    // Give our node a unique uuid
    newNode = update(newNode, { $merge: { uuid: generateUUID() } });

    // Add our node
    newDef = update(newDef, {
        nodes: {
            $push: [newNode]
        },
        _ui: {
            nodes: { $merge: { [newNode.uuid]: ui } }
        }
    });

    // Save our pending connection if we have one
    if (pendingConnection) {
        dispatch(updatePendingConnections(newNode.uuid, pendingConnection));
    }

    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    dispatch(setFreshestNode(newNode));

    console.timeEnd('addNode');
};

/**
 * Updates an exit in our tree
 * @param uuid the exit to modify
 * @param changes immutability spec to modify at the given exit
 */
export const updateExit = (exitUUID: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const details = getDetails(exitUUID, getState().components);

    const newDef = update(
        { ...getState().definition },
        {
            nodes: { [details.nodeIdx]: { exits: { [details.exitIdx]: changes } } }
        }
    );

    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
};

export const updateExitDestination = (exitUUID: string, destination: string) => (
    dispatch: DispatchWithState
) =>
    dispatch(
        updateExit(exitUUID, {
            $merge: { destination_node_uuid: destination }
        })
    );

export const disconnectExit = (exitUUID: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(updateExitDestination(exitUUID, null));
};

export const updateConnection = (source: string, target: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { nodeUUID } = getDetails(source, getState().components);
    if (nodeUUID !== target) {
        dispatch(updateExitDestination(source, target));
        dispatch(refresh(getState().definition));
    } else {
        console.error('Attempt to route to self, ignored...');
    }
};

export const resolvePendingConnection = (node: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    // Only resolve connection if we have one
    const pendingConnection = getPendingConnection(node.uuid, getState().pendingConnections);
    if (pendingConnection) {
        dispatch(updateExitDestination(pendingConnection.exitUUID, node.uuid));
        dispatch(refresh(getState().definition));
        // dispatch(updateUI(getState().definition));
        dispatch(setDefinition(getState().definition));
        // Remove our pending connection
        dispatch(removePendingConnection(node.uuid));
    }
};

export const updateNode = (uuid: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { nodeIdx } = getDetails(uuid, getState().components);
    const newDef = update({ ...getState().definition }, { nodes: { [nodeIdx]: changes } });
    dispatch(refresh(newDef));
    dispatch(markReflow());
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
};

export const ensureStartNode = () => (dispatch: DispatchWithState, getState: GetState) => {
    if (getState().definition.nodes.length === 0) {
        const initialAction: SendMsg = {
            uuid: generateUUID(),
            type: 'send_msg',
            text: 'Hi there, this the first message in your flow!'
        };

        const node: Node = {
            uuid: generateUUID(),
            actions: [initialAction],
            exits: [
                {
                    uuid: generateUUID()
                }
            ]
        };

        dispatch(addNode(node, { position: { x: 125, y: 125 } }));
    }
};

export const removeNode = (nodeToRemove: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const details = getDetails(nodeToRemove.uuid, getState().components);
    const node = getState().definition.nodes[details.nodeIdx];

    // If we have a single exit, map all our pointers to that destination
    let destination = null;
    if (node.exits.length === 1) {
        destination = node.exits[0].destination_node_uuid;
    }

    // Re-map all our pointers to our new destination, null some most cases
    for (const pointer of details.pointers) {
        // Don't allow it to point to ourselves
        const { nodeUUID } = getDetails(pointer, getState().components);
        if (nodeUUID === destination) {
            destination = null;
        }
        dispatch(updateExitDestination(pointer, destination));
    }

    // Remove the node
    // Remove it from the UI map as well
    const newDef = update(
        { ...getState().definition },
        {
            nodes: { $splice: [[details.nodeIdx, 1]] },
            _ui: { nodes: { $unset: [nodeToRemove.uuid] } }
        }
    );

    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    dispatch(ensureStartNode());
};

export const removeAction = (action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { nodeUUID } = getDetails(action.uuid, getState().components);
    // prettier-ignore
    const node = getNode(
        nodeUUID,
        getState().components,
        getState().definition
    );

    // If it's our last action, then nuke the node
    if (node.actions.length === 1) {
        dispatch(removeNode(node));
    } else {
        // Otherwise, just splice out that action
        const { actionIdx } = getDetails(action.uuid, getState().components);
        dispatch(
            updateNode(node.uuid, {
                actions: { $splice: [[actionIdx, 1]] }
            })
        );
    }
};

export const moveActionUp = (action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const details = getDetails(action.uuid, getState().components);
    // prettier-ignore
    const node = getNode(
        details.nodeUUID,
        getState().components,
        getState().definition
    );

    if (details.actionIdx > 0) {
        const actionAbove = node.actions[details.actionIdx - 1];
        dispatch(
            updateNode(node.uuid, {
                actions: { $splice: [[details.actionIdx - 1, 2, action, actionAbove]] }
            })
        );
    }
};

/**
 * Updates an action in our tree
 * @param uuid the action to modify
 * @param changes immutability spec to modify at the given action
 */
export const updateAction = (
    action: AnyAction,
    previousNodeUUID: string,
    draggedFrom: DragPoint = null,
    newPosition: Position = null
) => (dispatch: DispatchWithState, getState: GetState) => {
    console.time('updateAction');
    let newDef: FlowDefinition;

    if (draggedFrom) {
        const newNodeUUID = generateUUID();

        dispatch(
            addNode(
                {
                    uuid: newNodeUUID,
                    actions: [action],
                    exits: [{ uuid: generateUUID(), destination_node_uuid: null, name: null }]
                },
                { position: newPosition },
                {
                    exitUUID: draggedFrom.exitUUID,
                    nodeUUID: draggedFrom.nodeUUID
                }
            )
        );

        ({ definition: newDef } = getState());
    } else if (getState().userAddingAction) {
        const nodeDeets = getDetails(getState().nodeToEdit.uuid, getState().components);

        newDef = {
            ...update(getState().definition, {
                nodes: {
                    [nodeDeets.nodeIdx]: {
                        actions: {
                            $push: [action]
                        }
                    }
                }
            })
        };

        dispatch(refresh(newDef));
        dispatch(setFreshestNode(getState().nodeToEdit));
    } else {
        newDef = { ...getState().definition };
        // Update the action, flow definition
        const actionDetails = getDetails(action.uuid, getState().components);

        let node = null;
        let nodeIdx = -1;
        let actionIdx = -1;
        let nodeUUID;

        if (actionDetails) {
            node = newDef.nodes[actionDetails.nodeIdx];
            nodeIdx = actionDetails.nodeIdx;
            actionIdx = actionDetails.actionIdx;
            nodeUUID = actionDetails.nodeUUID;
        } else if (previousNodeUUID) {
            // HACK: look it up by previous node;
            // this should fall away with nodemodal refactor based on nodes.
            const nodeDetails = getDetails(previousNodeUUID, getState().components);
            node = newDef.nodes[nodeDetails.nodeIdx];
            nodeIdx = nodeDetails.nodeIdx;
            actionIdx = 0;
            nodeUUID = previousNodeUUID;
        }

        if (node) {
            if (node.actions && node.actions.length > 0) {
                newDef = update(newDef, {
                    nodes: {
                        [nodeIdx]: {
                            actions: { [actionIdx]: { $set: action } }
                        }
                    }
                });
            } else if (actionIdx === 0) {
                newDef = update(newDef, {
                    nodes: {
                        [nodeIdx]: {
                            actions: { $set: [action] }
                        }
                    }
                });
            }

            let previousDestination = null;
            let previousUUID = generateUUID();
            if (node.exits.length === 1) {
                previousDestination = node.exits[0].destination_node_uuid;
                previousUUID = node.exits[0].uuid;
            }

            newDef = update(newDef, {
                nodes: {
                    [nodeIdx]: {
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
                    }
                }
            });

            dispatch(updateNodeUI(nodeUUID, { $unset: ['type'] }));
            dispatch(setFreshestNode(newDef.nodes[nodeIdx]));
        } else {
            // otherwise we might be adding a new action
            console.log("Couldn't find node, not updating");
            return;
        }
    }

    dispatch(setUserAddingAction(false));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));
    dispatch(markReflow());

    console.timeEnd('updateAction');
};

/**
 * Splices a router into a list of actions creating up to three nodes where there
 * was once one node.
 * @param node the new node being added (shares the previous node uuid)
 * @param type the type of the new router
 * @param previousAction the previous action that is being replaced with our router
 */
export const spliceInRouter = (node: Node, type: string, previousAction: Action) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const previousNode = getNode(node.uuid, getState().components, getState().definition);
    const details = getDetails(previousAction.uuid, getState().components);

    // We need to splice a wait node where our previousAction was
    const topActions: Action[] =
        details.actionIdx > 0 ? [...previousNode.actions.slice(0, details.actionIdx)] : [];
    const bottomActions: Action[] = previousNode.actions.slice(
        details.actionIdx + 1,
        previousNode.actions.length
    );

    const previousUI = getNodeUI(node.uuid, getState().definition);
    const { x } = previousUI.position;
    let { y } = previousUI.position;

    // Add our new router node, do this fist so our top can point to it
    const routerY = topActions.length ? y + NODE_SPACING : y;

    dispatch(
        addNode(node, {
            position: { x, y: routerY },
            type
        })
    );

    // Add our top node if we have one
    if (topActions.length > 0) {
        const topActionNode: Node = {
            uuid: generateUUID(),
            actions: topActions,
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: getState().freshestNode.uuid
                }
            ]
        };

        dispatch(addNode(topActionNode, { position: { x, y } }));
        y += NODE_SPACING;
    }

    // Add our bottom
    if (bottomActions.length > 0) {
        const bottomActionNode: Node = {
            uuid: generateUUID(),
            actions: bottomActions,
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: previousNode.exits[0].destination_node_uuid
                }
            ]
        };
        dispatch(addNode(bottomActionNode, { position: { x, y } }));
        dispatch(
            updateExitDestination(
                getState().freshestNode.exits[0].uuid,
                getState().freshestNode.uuid
            )
        );
        y += NODE_SPACING;
    } else {
        dispatch(
            updateExitDestination(
                getState().freshestNode.exits[0].uuid,
                previousNode.exits[0].destination_node_uuid
            )
        );
    }

    // Remove our previous node since we created new nodes to take it's place
    dispatch(removeNode(previousNode));
};

/**
 * Appends a new node instead of editing the node in place
 */
export const appendNewRouter = (node: Node, type: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const previousNode = getNode(node.uuid, getState().components, getState().definition);
    const { position: { x, y } } = getNodeUI(node.uuid, getState().definition);

    dispatch(
        addNode(node, {
            position: { x, y: y + NODE_SPACING },
            type
        })
    );

    // Rewire our old connections
    dispatch(updateExitDestination(previousNode.exits[0].uuid, getState().freshestNode.uuid));

    // And our new node should point where the old one did
    const { destination_node_uuid: previousDestination } = previousNode.exits[0];
    dispatch(updateExitDestination(getState().freshestNode.exits[0].uuid, previousDestination));
};

export const updateRouter = (
    node: Node,
    type: string,
    draggedFrom: DragPoint = null,
    newPosition: Position = null,
    previousAction: Action = null
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { definition, components } = getState();
    let newNode = { ...node };
    const details = getDetails(newNode.uuid, components);
    const previousNode = getNode(newNode.uuid, components, definition);
    let newDef;

    if (
        details &&
        !details.type &&
        previousNode &&
        previousNode.actions &&
        previousNode.actions.length > 0
    ) {
        // Make sure our previous action exists in our map
        if (previousAction && getDetails(previousAction.uuid, components)) {
            return dispatch(spliceInRouter(newNode, type, previousAction));
        } else {
            return dispatch(appendNewRouter(newNode, type));
        }
    }

    if (draggedFrom) {
        // console.log("adding new router node", props);
        dispatch(
            addNode(
                newNode,
                { position: newPosition, type },
                {
                    exitUUID: draggedFrom.exitUUID,
                    nodeUUID: draggedFrom.nodeUUID
                }
            )
        );
        ({ freshestNode: newNode } = getState());
    } else {
        // We're updating
        ({ definition: newDef } = getState());
        const nodeDetails = getDetails(newNode.uuid, components);
        newDef = update(newDef, {
            nodes: { [nodeDetails.nodeIdx]: { $set: newNode } }
        });
        newNode = newDef.nodes[nodeDetails.nodeIdx];
        dispatch(updateNodeUI(newNode.uuid, { $merge: { type } }));
        dispatch(setDefinition(newDef));
    }

    ({ definition: newDef } = getState());

    dispatch(refresh(newDef));
    // dispatch(updateUI(newDef));
    dispatch(setDefinition(newDef));

    console.timeEnd('updateRouter');
};

export const onNodeBeforeDrag = (
    node: Node,
    plumberSetDragSelection: Function,
    plumberClearDragSelection: Function
) => (dispatch: DispatchWithState, getState: GetState) => {
    if (getState().nodeDragging) {
        if (getState().dragGroup) {
            const nodesBelow = getNodesBelow(node, getState().nodes);
            plumberSetDragSelection(nodesBelow);
        } else {
            plumberClearDragSelection();
        }
    }
};

export const resetNewConnectionState = () => (dispatch: DispatchWithState, getState: GetState) => {
    dispatch(updateGhostNode(null));

    if (getState().pendingConnection) {
        dispatch(updatePendingConnection(null));
    }

    if (getState().createNodePosition) {
        dispatch(updateCreateNodePosition(null));
    }

    if (getState().nodeToEdit) {
        dispatch(updateNodeToEdit(null));
    }
};

export const onUpdateAction = (node: Node, action: AnyAction, repaintForDuration: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(
        updateAction(action, node.uuid, getState().pendingConnection, getState().createNodePosition)
    );
    dispatch(resetNewConnectionState());
    repaintForDuration();
};

export const onAddAction = (node: Node, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(setUserAddingAction(true));

    const newAction: SendMsg = {
        uuid: generateUUID(),
        type: 'send_msg',
        text: ''
    };

    dispatch(setActionToEdit(newAction));
    dispatch(setNodeToEdit(node));

    const localizations = [];
    if (getState().translating) {
        const translations = getTranslations(getState().definition, getState().language);
        localizations.push(
            // prettier-ignore
            ...getLocalizations(
                node,
                newAction,
                getState().language.iso,
                languages,
                translations
            )
        );
    }

    dispatch(setLocalizations(localizations));
    dispatch(setTypeConfig(getTypeConfig(newAction.type)));
    dispatch(setNodeDragging(false));
    dispatch(setNodeEditorOpen(true));
};

export const onNodeEditorClose = (canceled: boolean, connectExit: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    // Make sure we re-wire the old connection
    if (canceled) {
        if (getState().pendingConnection) {
            const exit = getExit(
                getState().pendingConnection.exitUUID,
                getState().components,
                getState().definition
            );

            if (exit) {
                connectExit(exit);
            }
        }
    }

    dispatch(updateGhostNode(null));
    dispatch(resetNewConnectionState());
};

export const onNodeMoved = (uuid: string, position: Position, repaintForDuration: Function) => (
    dispatch: DispatchWithState
) => {
    dispatch(
        updateNodeUI(uuid, {
            position: { $set: position }
        })
    );

    repaintForDuration();
};

/**
 * Called when a connection begins to be dragged from an endpoint both
 * when a new connection is desired or when an existing one is being moved.
 * @param event
 */
export const onConnectionDrag = (event: ConnectionEvent) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    // We finished dragging a ghost node, create the spec for our new ghost component
    const draggedFromDetails = getDetails(event.sourceId, getState().components);

    const fromNode = getNode(
        draggedFromDetails.nodeUUID,
        getState().components,
        getState().definition
    );

    const fromNodeUI = getNodeUI(fromNode.uuid, getState().definition);

    const draggedFrom = {
        nodeUUID: draggedFromDetails.nodeUUID,
        exitUUID: draggedFromDetails.exitUUID
    };

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
    if (fromNode.wait || fromNodeUI.type === 'webhook') {
        const replyAction: SendMsg = {
            uuid: generateUUID(),
            type: 'send_msg',
            text: ''
        };

        ghostNode.actions.push(replyAction);
    } else {
        // Otherwise make it a switch router
        ghostNode.exits[0].name = 'All Responses';
        ghostNode.router = { type: 'switch' };
    }

    // Set our ghost spec so it gets rendered.
    // TODO: this is here to workaround a jsplumb
    // weirdness where offsets go off the handle upon
    // dragging connections.
    // window.setTimeout(() => dispatch(updateGhostNode(ghostNode)), 0);
    dispatch(updateGhostNode(ghostNode));

    // Save off our drag point for later
    // this.pendingConnection = draggedFrom;
    dispatch(updatePendingConnection(draggedFrom));
};

export const onUpdateRouter = (
    node: Node,
    type: string,
    repaintForDuration: Function,
    previousAction?: Action
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { uuid: nodeUUID } = node;
    const { nodeToEdit: { uuid: newNodeUUID } } = getState();

    dispatch(
        updateRouter(
            node,
            type,
            getState().pendingConnection,
            getState().createNodePosition,
            previousAction
        )
    );

    if (nodeUUID !== newNodeUUID) {
        repaintForDuration();
    }

    dispatch(resetNewConnectionState());
};

export const onOpenNodeEditor = (node: Node, action: AnyAction, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const localizations = [];
    if (getState().translating) {
        // prettier-ignore
        const translations = getTranslations(
            getState().definition,
            getState().language
        );

        localizations.push(
            // prettier-ignore
            ...getLocalizations(
                node,
                action,
                getState().language.iso,
                languages,
                translations
            )
        );
    }

    dispatch(setNodeToEdit(node));
    dispatch(setLocalizations(localizations));

    // Account for hybrids or clicking on the empty exit table
    if (getState().nodeToEdit.actions && getState().nodeToEdit.actions.length) {
        dispatch(
            setActionToEdit(getState().nodeToEdit.actions[getState().nodeToEdit.actions.length - 1])
        );
    }

    // prettier-ignore
    const type = determineConfigType(
        getState().nodeToEdit,
        getState().nodeToEdit.actions || [],
        getState().definition,
        getState().components
    );

    const config = getTypeConfig(type);
    dispatch(setTypeConfig(config));

    let operand = DEFAULT_OPERAND;
    let resultName = '';

    if (getState().nodeToEdit.router) {
        if (getState().nodeToEdit.router.result_name) {
            ({ nodeToEdit: { router: { result_name: resultName } } } = getState());
        }

        if (hasCases(getState().nodeToEdit)) {
            ({ operand } = getState().nodeToEdit.router as SwitchRouter);
        }
    }

    dispatch(updateResultName(resultName));
    dispatch(setShowResultName(resultName.length > 0));
    dispatch(updateOperand(operand));
    dispatch(setNodeDragging(false));
    dispatch(setNodeEditorOpen(true));
};
