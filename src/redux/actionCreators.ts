import update from 'immutability-helper';
import { Dispatch } from 'react-redux';
import { v4 as generateUUID } from 'uuid';
import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { FlowDetails, getFlow, getFlows } from '../external';
import {
    Action,
    AnyAction,
    ChangeGroup,
    Dimensions,
    Exit,
    FlowDefinition,
    Languages,
    Node,
    Position,
    Reply,
    SaveFlowResult,
    SaveToContact,
    UINode
} from '../flowTypes';
import {
    collides,
    getDetails,
    getExit,
    getLocalizations,
    getNode,
    getNodesBelow,
    getNodeUI,
    getPendingConnection,
    jsonEqual,
    pureSort,
    snakify
} from '../utils';
import { getTranslations } from '../utils';
import {
    removePendingConnection,
    updateActionToEdit,
    updateAddToNode,
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
    updatePendingConnection,
    updatePendingConnections,
    updateResultNames,
    updateTranslating,
    updateUserClickingAction,
    updateUserClickingNode,
    updateConfirmDelete
} from './actions';
import { UpdateFlows } from './actionTypes';
import { ComponentDetails, ContactFieldResult, ReduxState, SearchResult } from './initialState';

export type DispatchWithState = Dispatch<ReduxState>;

export type GetState = () => ReduxState;

type StandardThunk = (dispatch: DispatchWithState, getState: GetState) => void;

export type FetchFlowAC = (
    endpoint: string,
    uuid: string
) => (dispatch: DispatchWithState, getState: GetState) => Promise<void>;

export type FetchFlowsAC = (
    endpoint: string
) => (dispatch: DispatchWithState, getState: GetState) => Promise<void | UpdateFlows>;

export type SetLanguageAC = (language: Language) => StandardThunk;

export type SetTranslatingAC = (translating: boolean) => StandardThunk;

export type SetNodeDraggingAC = (nodeDragging: boolean) => StandardThunk;

export type EnsureStartNodeAC = () => StandardThunk;

export type ResolvePendingConnections = (node: Node) => StandardThunk;

export type UpdateConnectionAC = (source: string, target: string) => StandardThunk;

export type UpdateNodeUIAC = (uuid: string, changes: any) => StandardThunk;

export type SetNodeEditorOpenAC = (nodeEditorOpen: boolean) => StandardThunk;

export type ResetNewConnectionStateAC = () => (
    dispatch: DispatchWithState,
    getState: GetState
) => void;

export type OnConnectionDragAC = (event: ConnectionEvent) => StandardThunk;

export type UpdateCreateNodePositionA = (createNodePosition: Position) => StandardThunk;

export type OnNodeBeforeDragAC = (
    node: Node,
    setDragSelection: Function,
    clearDragSelection: Function
) => StandardThunk;

export type ResolvePendingConnectionAC = (node: Node) => StandardThunk;

export type OnAddActionAC = (node: Node) => StandardThunk;

export type SetUserClickingActionAC = (userClickingAction: boolean) => StandardThunk;

export type OnNodeMovedAC = (
    uuid: string,
    position: Position,
    plumberRepaintForDuration: Function
) => StandardThunk;

export type OnOpenNodeEditorAC = (node: Node, ui: UINode, languages: Languages) => StandardThunk;

export type RemoveNodeAC = (nodeToRemove: Node) => StandardThunk;

export type UpdateDimensionsAC = (node: Node, dimensions: Dimensions) => StandardThunk;

export type MoveActionUpAC = (action: AnyAction) => StandardThunk;

export type RemoveActionAC = (action: AnyAction) => StandardThunk;

export type SetDragGroupAC = (dragGroup: boolean) => StandardThunk;

export type SetUserClickingNodeAC = (userClickingNode: boolean) => StandardThunk;

export type SetConfirmDeleteAC = (confirmDelete: boolean) => StandardThunk;

export type DisconnectExitAC = (exitUUID: string) => StandardThunk;

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
    endpoints: any[];
}

type LocalizationUpdates = Array<{ uuid: string; translations?: any }>;

const FORCE_FETCH = true;
const QUIET_UI = 10;
const QUIET_SAVE = 1000;
const NODE_SPACING = 60;

const RESERVED_FIELDS: ContactFieldResult[] = [
    { id: 'name', name: 'Name', type: 'update_contact' }
    // { id: "language", name: "Language", type: "update_contact" }
];

let uiTimeout: number;
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
    if (!jsonEqual(language, getState().language)) {
        dispatch(updateLanguage(language));
    }
};

export const setFreshestNode = (freshestNode: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!jsonEqual(freshestNode, getState().freshestNode)) {
        updateFreshestNode(freshestNode);
    }
};

export const setUserClickingAction = (userClickingAction: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (userClickingAction !== getState().userClickingAction) {
        updateUserClickingAction(userClickingAction);
    }
};

export const setNodeDragging = (nodeDragging: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (nodeDragging !== getState().nodeDragging) {
        updateNodeDragging(nodeDragging);
    }
};

export const setNodeEditorOpen = (nodeEditorOpen: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (nodeEditorOpen !== getState().nodeEditorOpen) {
        updateNodeEditorOpen(nodeEditorOpen);
    }
};

export const setDragGroup = (dragGroup: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (dragGroup !== getState().dragGroup) {
        updateDragGroup(dragGroup);
    }
};

export const setUserClickingNode = (userClickingNode: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (userClickingNode !== getState().userClickingNode) {
        updateUserClickingNode(userClickingNode);
    }
};

export const setConfirmDelete = (confirmDelete: boolean) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (confirmDelete !== getState().confirmDelete) {
        updateConfirmDelete(confirmDelete);
    }
};

export const fetchFlow = (endpoint: string, uuid: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    if (!getState().definition) {
        dispatch(updateFetchingFlow(true));
        return getFlow(endpoint, uuid, false)
            .then(({ definition }: FlowDetails) => {
                dispatch(updateDefinition(definition));
                dispatch(updateFetchingFlow(false));
            })
            .catch((error: any) => console.log(`fetchFlow error: ${error}`));
    }
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
                    const resultProps = action as SaveFlowResult;
                    resultNames[snakify(resultProps.result_name)] = resultProps.result_name;
                } else if (action.type === 'save_contact_field') {
                    const saveProps = action as SaveToContact;
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
                    const groupProps = action as ChangeGroup;
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

    dispatch(updateContactFields(existingFields));
    dispatch(updateGroups(existingGroups));
    dispatch(updateComponents(components));
    dispatch(updateResultNames(existingResultNames));
    dispatch(updateNodes(definition.nodes));
};

export const updateUI = (definition: FlowDefinition) => (dispatch: DispatchWithState) => {
    if (QUIET_UI > 0) {
        if (uiTimeout) {
            window.clearTimeout(uiTimeout);
        }
        uiTimeout = window.setTimeout(() => dispatch(updateDefinition(definition)));
    } else {
        dispatch(updateDefinition(definition));
    }
};

export const sortNodes = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { definition } = getState();

    // Find our first node
    let top: Position;
    let topNode: string;

    const nodeSort = (a: Node, b: Node) => {
        const aPos = definition._ui.nodes[a.uuid].position;
        const bPos = definition._ui.nodes[b.uuid].position;
        let diff = aPos.y - bPos.y;
        // Secondary sort on X location
        if (diff === 0) {
            diff = aPos.x - bPos.x;
        }
        return diff;
    };

    const newDef = { ...definition, nodes: pureSort(definition.nodes, nodeSort) };

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
    if (!jsonEqual(newDef, definition)) {
        dispatch(updateUI(newDef));
    }
};

export const reflow = () => (dispatch: DispatchWithState, getState: GetState) => {
    console.time('reflow');

    dispatch(sortNodes());

    const { definition } = getState();

    let newDef = { ...definition };

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

    const dirty = false;
    let previous: Reflow;

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
                const diff = current.bounds.bottom - other.bounds.top + NODE_SPACING;
                other.bounds.top += diff;
                other.bounds.bottom += diff;

                updatedNodes.push(other);

                // see if our collision cascades
                if (uis.length > j + 1) {
                    const next = uis[j + 1];
                    // if (this.collides(other.bounds, next.bounds)) {
                    // if so, push everybody else down
                    for (let k = j + 1; k < uis.length; k++) {
                        const below = uis[k];
                        below.bounds.top += diff;
                        below.bounds.bottom += diff;
                        updatedNodes.push(below);
                    }
                    // }
                }
                break;
            } else if (other.bounds.top > current.bounds.bottom) {
                // If they start below our lowest point, move on
                break;
            }
        }

        previous = current;
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

            dispatch(updateUI(newDef));
        }
    }, 100);

    console.timeEnd('reflow');
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
    const { definition } = getState();
    let newDef = { ...definition };

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
    dispatch(updateUI(newDef));
};

export const updateNodeUI = (uuid: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition } = getState();
    const updateNodeUIChanges = { _ui: { nodes: { [uuid]: changes } } };
    const newDef = update(definition, updateNodeUIChanges);
    dispatch(markReflow());
    dispatch(updateUI(definition));
};

export const updateDimensions = (node: Node, dimensions: Dimensions) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { definition } = getState();
    const ui = getNodeUI(node.uuid, definition);
    if (
        !ui.dimensions ||
        ui.dimensions.height !== dimensions.height ||
        ui.dimensions.width !== dimensions.width
    ) {
        const updateDimensionsChanges = { $merge: { dimensions } };
        dispatch(updateNodeUI(node.uuid, updateDimensionsChanges));
    }
};

export const addNode = (node: Node, ui: UINode, pendingConnection?: DragPoint) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    console.time('addNode');
    const { definition } = getState();
    let newNode = { ...node };
    let newDef = { ...definition };

    // Give our node a unique uuid
    newNode = update(newNode, { $merge: { uuid: generateUUID() } });

    // Add our node
    newDef = update(newDef, {
        nodes: {
            $push: [node]
        },
        _ui: {
            nodes: { $merge: { [node.uuid]: ui } }
        }
    });

    // Save our pending connection if we have one
    if (pendingConnection) {
        dispatch(updatePendingConnections(node.uuid, pendingConnection));
    }

    dispatch(refresh(newDef));
    dispatch(updateUI(newDef));
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
    const { definition, components } = getState();
    const details = getDetails(exitUUID, components);

    let newDef = { ...definition };
    newDef = update(newDef, {
        nodes: { [details.nodeIdx]: { exits: { [details.exitIdx]: changes } } }
    });

    dispatch(updateUI(newDef));
};

export const updateExitDestination = (exitUUID: string, destination: string) => (
    dispatch: DispatchWithState
) => {
    dispatch(
        updateExit(exitUUID, {
            $merge: { destination_node_uuid: destination }
        })
    );
};

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
    const { components } = getState();
    const { nodeUUID } = getDetails(source, components);
    if (nodeUUID !== target) {
        updateExitDestination(source, target);
        const { definition } = getState();
        dispatch(refresh(definition));
    } else {
        console.error('Attempt to route to self, ignored...');
    }
};

export const resolvePendingConnection = (node: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { pendingConnections } = getState();
    // Only resolve connection if we have one
    const pendingConnection = getPendingConnection(node.uuid, pendingConnections);
    if (pendingConnection) {
        dispatch(updateExitDestination(pendingConnection.exitUUID, node.uuid));
        const { definition } = getState();
        dispatch(refresh(definition));
        dispatch(updateUI(definition));
        // Remove our pending connection
        dispatch(removePendingConnection(node.uuid));
    }
};

export const updateNode = (uuid: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { components, definition } = getState();
    const { nodeIdx } = getDetails(uuid, components);
    let newDef = { ...definition };
    newDef = update(newDef, { nodes: { [nodeIdx]: changes } });
    dispatch(refresh(newDef));
    dispatch(markReflow());
    dispatch(updateUI(newDef));
};

export const ensureStartNode = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { definition } = getState();
    if (definition.nodes.length === 0) {
        const initialAction: Reply = {
            uuid: generateUUID(),
            type: 'reply',
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

        const position = { position: { x: 0, y: 0 } };

        dispatch(addNode(node, position));
    }
};

export const removeNode = (nodeToRemove: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { components, definition } = getState();
    const details = getDetails(nodeToRemove.uuid, components);
    const node = definition.nodes[details.nodeIdx];

    // If we have a single exit, map all our pointers to that destination
    let destination = null;
    if (node.exits.length === 1) {
        destination = node.exits[0].destination_node_uuid;
    }

    // Re-map all our pointers to our new destination, null some most cases
    for (const pointer of details.pointers) {
        // Don't allow it to point to ourselves
        const { nodeUUID } = getDetails(pointer, components);
        if (nodeUUID === destination) {
            destination = null;
        }
        dispatch(updateExitDestination(pointer, destination));
    }

    let newDef = { ...definition };
    // Now remove ourselves
    newDef = update(newDef, { nodes: { $splice: [[details.nodeIdx, 1]] } });
    // Remove us from the ui map as well
    newDef = update(newDef, { _ui: { nodes: { $unset: [nodeToRemove.uuid] } } });

    dispatch(ensureStartNode());
    dispatch(refresh(newDef));
    dispatch(updateUI(definition));
};

export const removeAction = (action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { components, definition } = getState();
    const details = getDetails(action.uuid, components);
    const node = definition.nodes[details.nodeIdx];

    // If it's our last action, then nuke the node
    if (node.actions.length === 1) {
        dispatch(removeNode(node));
    } else {
        // Otherwise, just splice out that action
        const deets = getDetails(action.uuid, components);
        dispatch(
            updateNode(node.uuid, {
                actions: { $splice: [[deets.actionIdx, 1]] }
            })
        );
    }

    const { definition: updatedDef } = getState();
    dispatch(updateUI(updatedDef));
};

export const moveActionUp = (action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { components, definition } = getState();
    const details = getDetails(action.uuid, components);
    const node = definition.nodes[details.nodeIdx];

    if (details.actionIdx > 0) {
        const actionAbove = node.actions[details.actionIdx - 1];
        dispatch(
            updateNode(node.uuid, {
                actions: { $splice: [[details.actionIdx - 1, 2, action, actionAbove]] }
            })
        );
    }

    const { definition: updateDef } = getState();
    dispatch(updateUI(updateDef));
};

/**
 * Updates an action in our tree
 * @param uuid the action to modify
 * @param changes immutability spec to modify at the given action
 */
export const setAction = (
    action: AnyAction,
    previousNodeUUID: string,
    draggedFrom: DragPoint = null,
    newPosition: Position = null,
    addToNode: Node = null
) => (dispatch: DispatchWithState, getState: GetState) => {
    console.time('setAction');
    var newNode: Node;

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
        ({ freshestNode: newNode } = getState());
    } else if (addToNode) {
        const { components, definition } = getState();
        const nodeDeets = getDetails(addToNode.uuid, components);
        const newDef = {
            ...update(definition, {
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
    } else {
        const { components, definition } = getState();
        // Update the action into our new flow definition
        const actionDetails = getDetails(action.uuid, components);

        newNode = null;
        let nodeIdx = -1;
        let actionIdx = -1;
        let nodeUUID;

        if (actionDetails) {
            newNode = definition.nodes[actionDetails.nodeIdx];
            nodeIdx = actionDetails.nodeIdx;
            actionIdx = actionDetails.actionIdx;
            nodeUUID = actionDetails.nodeUUID;
        } else if (previousNodeUUID) {
            // HACK: look it up by previous node;
            // this should fall away with nodemodal refactor based on nodes.
            const nodeDetails = getDetails(previousNodeUUID, components);
            newNode = definition.nodes[nodeDetails.nodeIdx];
            nodeIdx = nodeDetails.nodeIdx;
            actionIdx = 0;
            nodeUUID = previousNodeUUID;
        }

        if (newNode) {
            let newDef = { ...definition };

            if (newNode.actions && newNode.actions.length > 0) {
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
            if (newNode.exits.length === 1) {
                previousDestination = newNode.exits[0].destination_node_uuid;
                previousUUID = newNode.exits[0].uuid;
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

            // make sure we don't have a type set
            const LocalizationMap = newDef._ui.nodes[nodeUUID];
            dispatch(updateNodeUI(nodeUUID, { $unset: ['type'] }));
            newNode = newDef.nodes[nodeIdx];
        } else {
            // otherwise we might be adding a new action
            console.log("Couldn't find node, not updating");
            return;
        }
    }

    const { definition: updatedDef } = getState();
    dispatch(updateUI(updatedDef));
    dispatch(markReflow());
    console.timeEnd('setAction');
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
    const { components, definition } = getState();
    const previousNode = getNode(node.uuid, components, definition);
    const details = getDetails(previousAction.uuid, components);

    // We need to splice a wait node where our previousAction was
    const topActions: Action[] = [];
    const bottomActions: Action[] = previousNode.actions.slice(
        details.actionIdx + 1,
        previousNode.actions.length
    );
    if (details.actionIdx > 0) {
        topActions.push(...previousNode.actions.slice(0, details.actionIdx));
    }

    let lastNode: Node;

    const previousUI = getNodeUI(node.uuid, definition);
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

    const { freshestNode: newRouterNode } = getState();

    // Add our top node if we have one
    if (topActions.length > 0) {
        const topActionNode: Node = {
            uuid: generateUUID(),
            actions: topActions,
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: newRouterNode.uuid
                }
            ]
        };

        dispatch(addNode(topActionNode, { position: { x, y } }));
        ({ freshestNode: lastNode } = getState());
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
        ({ freshestNode: lastNode } = getState());
        dispatch(updateExitDestination(newRouterNode.exits[0].uuid, lastNode.uuid));
        y += NODE_SPACING;
    } else {
        dispatch(
            updateExitDestination(
                newRouterNode.exits[0].uuid,
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
    const { components, definition } = getState();
    const previousNode = getNode(node.uuid, components, definition);
    const { position: { x, y } } = getNodeUI(node.uuid, definition);

    dispatch(
        addNode(node, {
            position: { x, y: y + NODE_SPACING },
            type
        })
    );

    const { freshestNode: newRouterNode } = getState();
    // Rewire our old connections
    const { destination_node_uuid: previousDestination } = previousNode.exits[0];
    dispatch(updateExitDestination(previousNode.exits[0].uuid, newRouterNode.uuid));
    // And our new node should point where the old one did
    dispatch(updateExitDestination(newRouterNode.exits[0].uuid, previousDestination));
};

export const updateRouter = (
    node: Node,
    type: string,
    draggedFrom: DragPoint = null,
    newPosition: Position = null,
    previousAction: Action = null
) => (dispatch: DispatchWithState, getState: GetState) => {
    console.time('updateRouter');

    const { definition, components } = getState();
    let newNode = { ...node };
    const details = getDetails(newNode.uuid, components);
    const previousNode = getNode(newNode.uuid, components, definition);

    if (
        details &&
        !details.type &&
        previousNode &&
        previousNode.actions &&
        previousNode.actions.length > 0
    ) {
        // make sure our previous action exists in our map
        if (previousAction && getDetails(previousAction.uuid, components)) {
            return dispatch(spliceInRouter(newNode, type, previousAction));
        } else {
            return dispatch(appendNewRouter(newNode, type));
        }
    }

    if (draggedFrom) {
        // console.log("adding new router newNode", props);
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
        const nodeDetails = getDetails(newNode.uuid, components);
        let { definition: updatedDef } = getState();
        updatedDef = update(updatedDef, {
            nodes: { [nodeDetails.nodeIdx]: { $set: newNode } }
        });
        newNode = updatedDef.nodes[nodeDetails.nodeIdx];
        // Update our type
        const LocalizationMap = updatedDef._ui.nodes[newNode.uuid];
        dispatch(updateNodeUI(newNode.uuid, { $merge: { type } }));
    }

    const { definition: updateDef } = getState();
    dispatch(refresh(updateDef));
    dispatch(updateUI(updateDef));
    console.timeEnd('updateRouter');
};

export const onNodeBeforeDrag = (
    node: Node,
    plumberSetDragSelection: Function,
    plumberClearDragSelection: Function
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { nodeDragging, dragGroup, nodes } = getState();
    if (nodeDragging) {
        if (dragGroup) {
            const nodesBelow = getNodesBelow(node, nodes);
            plumberSetDragSelection(nodesBelow);
        } else {
            plumberClearDragSelection();
        }
    }
};

export const resetNewConnectionState = () => (dispatch: DispatchWithState, getState: GetState) => {
    dispatch(updateGhostNode(null));

    const { pendingConnection, createNodePosition, addToNode } = getState();
    if (pendingConnection) {
        dispatch(updatePendingConnection(null));
    }

    if (createNodePosition) {
        dispatch(updateCreateNodePosition(null));
    }

    if (addToNode) {
        dispatch(updateAddToNode(null));
    }
};

export const onUpdateAction = (node: Node, action: AnyAction, repaintForDuration: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { pendingConnection, createNodePosition, addToNode } = getState();
    dispatch(setAction(action, node.uuid, pendingConnection, createNodePosition, addToNode));
    dispatch(resetNewConnectionState());
    repaintForDuration();
};

export const onAddAction = (node: Node) => (dispatch: DispatchWithState) => {
    const newAction: Reply = {
        uuid: generateUUID(),
        type: 'reply',
        text: ''
    };

    dispatch(updateNodeToEdit(node));
    dispatch(updateActionToEdit(newAction));
    dispatch(updateAddToNode(node));
    dispatch(setNodeEditorOpen(true));
};

export const onNodeEditorClose = (canceled: boolean, connectExit: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    // Make sure we re-wire the old connection
    if (canceled) {
        const { pendingConnection, components, definition } = getState();
        if (pendingConnection) {
            const exit = getExit(pendingConnection.exitUUID, components, definition);
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
    const { components, definition } = getState();
    // We finished dragging a ghost node, create the spec for our new ghost component
    const draggedFromDetails = getDetails(event.sourceId, components);
    const fromNode = getNode(draggedFromDetails.nodeUUID, components, definition);
    const fromNodeUI = getNodeUI(fromNode.uuid, definition);
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
        const replyAction: Reply = {
            uuid: generateUUID(),
            type: 'reply',
            text: ''
        };
        ghostNode.actions.push(replyAction);
    } else {
        // Otherwise we are going to a switch
        ghostNode.exits[0].name = 'All Responses';
        ghostNode.router = { type: 'switch' };
    }

    // Set our ghost spec so it gets rendered.
    // TODO: this is here to workaround a jsplumb
    // weirdness where offsets go off the handle upon
    // dragging connections.
    window.setTimeout(() => dispatch(updateGhostNode(ghostNode)), 0);

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
    console.log('Flow.onUpdateRouter', node);

    const { uuid: nodeUUID } = node;
    const { pendingConnection, createNodePosition } = getState();

    dispatch(updateRouter(node, type, pendingConnection, createNodePosition, previousAction));

    const { freshestNode } = getState();
    const { uuid: newNodeUUID } = freshestNode;

    if (nodeUUID !== newNodeUUID) {
        repaintForDuration();
    }

    // this.resetState();
    dispatch(resetNewConnectionState());
};

export const onOpenNodeEditor = (node: Node, ui: UINode, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const localizations = [];

    const { definition, translating, language } = getState();
    // Click the last action in the list if we have one
    if (translating) {
        const translations = getTranslations(definition, language);
        localizations.push(
            // prettier-ignore
            ...getLocalizations(
                node,
                language.iso,
                languages,
                translations
            )
        );
    }

    dispatch(updateNodeToEdit(node));
    dispatch(updateLocalizations(localizations));

    // Account for hybrids or clicking on the empty exit table
    if (node.actions && node.actions.length) {
        dispatch(updateActionToEdit(node.actions[node.actions.length - 1]));
    }

    setNodeDragging(false);
    setNodeEditorOpen(true);
};
