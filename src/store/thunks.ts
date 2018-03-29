const update = require('immutability-helper');
import { Dispatch } from 'react-redux';
import { v4 as generateUUID } from 'uuid';
import { DragPoint } from '../component/Node';
import { hasCases } from '../component/NodeEditor/NodeEditor';
import { getTypeConfig } from '../config';
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
    SetContactField,
    SetRunResult,
    SwitchRouter,
    UINode,
    WaitType
} from '../flowTypes';
import { snakify, dump } from '../utils';
import {
    updateContactFields,
    updateDefinition,
    updateGroups,
    updateLocalizations,
    updateResultNames,
    RenderNode,
    updateNodes
} from './flowContext';
import {
    removePendingConnection,
    updateCreateNodePosition,
    updateFetchingFlow,
    updateFlows,
    updateFreshestNode,
    updateGhostNode,
    updateNodeDragging,
    updateNodeEditorOpen,
    updatePendingConnection,
    updatePendingConnections
} from './flowEditor';
import {
    determineConfigType,
    getExistingFields,
    getExistingGroups,
    getExistingResultNames,
    getLocalizations,
    getNodesBelow,
    getNodeUI,
    getPendingConnection,
    getSuggestedResultName,
    getTranslations,
    getNodeBoundaries,
    getCollisions,
    nodeSort,
    pureSort,
    getGhostNode,
    getUniqueDestinations
} from './helpers';
import {
    updateActionToEdit,
    updateNodeToEdit,
    updateOperand,
    updateResultName,
    updateTypeConfig,
    updateUserAddingAction,
    updateShowResultName
} from './nodeEditor';
import AppState from './state';
import { uniquifyNode, prepUpdateDestination } from './updateSpec';
import { ContactFieldResult, SearchResult } from './flowContext';
import { render } from 'enzyme';

export type DispatchWithState = Dispatch<AppState>;

export type GetState = () => AppState;

export type Thunk = (dispatch: DispatchWithState, getState?: GetState) => void;

export type AsyncThunk = (dispatch: DispatchWithState, getState?: GetState) => Promise<void>;

export type OnNodeBeforeDrag = (
    node: Node,
    plumberSetDragSelection: Function,
    plumberClearDragSelection: Function
) => Thunk;

export type ResolvePendingConnection = (node: Node) => Thunk;

export type OnAddAction = (node: Node, languages: Languages) => Thunk;

export type OnNodeMoved = (uuid: string, position: Position, repaintForDuration: Function) => Thunk;

export type OnOpenNodeEditor = (node: Node, action: AnyAction, languages: Languages) => Thunk;

export type RemoveNode = (nodeToRemove: Node) => Thunk;

export type UpdateDimensions = (node: Node, dimensions: Dimensions) => Thunk;

export type FetchFlow = (endpoint: string, uuid: string) => AsyncThunk;

export type FetchFlows = (endpoint: string) => AsyncThunk;

export type NoParamsAC = () => Thunk;

export type UpdateConnection = (source: string, target: string) => Thunk;

export type OnConnectionDrag = (event: ConnectionEvent) => Thunk;

export type OnUpdateLocalizations = (language: string, changes: LocalizationUpdates) => Thunk;

export type OnUpdateAction = (node: Node, action: AnyAction, repaintForDuration: Function) => Thunk;

export type ActionAC = (nodeUUID: string, action: AnyAction) => Thunk;

export type DisconnectExit = (nodeUUID: string, exitUUID: string) => Thunk;

export type OnUpdateRouter = (
    node: Node,
    type: string,
    repaintForDuration: Function,
    previousAction?: Action
) => Thunk;

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
    { id: 'name', name: 'Name', type: 'set_contact_field' }
    // { id: "language", name: "Language", type: "update_contact" }
];

// let uiTimeout: number;
let reflowTimeout: number;

export const initializeFlow = (definition: FlowDefinition) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const nodes: { [uuid: string]: RenderNode } = {};
    const exits: { [uuid: string]: string } = {};

    // initialize our nodes
    const pointerMap: { [uuid: string]: { [uuid: string]: string } } = {};
    for (const node of definition.nodes) {
        nodes[node.uuid] = { node, ui: definition._ui.nodes[node.uuid] };

        for (const exit of node.exits) {
            if (exit.destination_node_uuid) {
                let pointers: { [uuid: string]: string } = pointerMap[exit.destination_node_uuid];

                if (!pointers) {
                    pointers = {};
                }

                pointers[exit.uuid] = node.uuid;
                pointerMap[exit.destination_node_uuid] = pointers;
            }
            exits[exit.uuid] = node.uuid;
        }
    }

    // store our pointers with their associated nodes
    for (const nodeUUID of Object.keys(pointerMap)) {
        nodes[nodeUUID].inboundConnections = pointerMap[nodeUUID];
    }

    // store our flow definition without any nodes
    const updated = update(definition, {
        $merge: { nodes: [] },
        _ui: { $merge: { nodes: [] } }
    });

    dispatch(updateDefinition(updated));
    dispatch(updateNodes(nodes));
    dispatch(updateFetchingFlow(false));
};

export const fetchFlow = (endpoint: string, uuid: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(updateFetchingFlow(true));
    return getFlow(endpoint, uuid, false)
        .then(({ definition }: FlowDetails) => {
            dispatch(initializeFlow(definition));
        })
        .catch((error: any) => console.log(`fetchFlow error: ${error}`));
};

export const fetchFlows = (endpoint: string) => (dispatch: DispatchWithState) =>
    getFlows(endpoint)
        .then((flows: FlowDetails[]) => {
            dispatch(
                updateFlows(
                    flows.map(({ uuid, name }) => ({
                        uuid,
                        name
                    }))
                )
            );
        })
        .catch((error: any) => console.log(`fetchFlowList error: ${error}`));

export const reflow = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { flowContext: { nodes } } = getState();

    const collisions = getCollisions(nodes, NODE_SPACING);

    let newNodes = { ...nodes };
    window.setTimeout(() => {
        if (collisions.length > 0) {
            console.time('reflow');
            console.log('::REFLOWED::', collisions);
            collisions.forEach(
                node =>
                    (newNodes = update(newNodes, {
                        nodes: {
                            [node.uuid]: { ui: { position: { $merge: { y: node.bounds.top } } } }
                        }
                    }))
            );

            dispatch(updateNodes(newNodes));
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
    let newDef = { ...getState().flowContext.definition };

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

    // Update definiti
    dispatch(updateDefinition(newDef));
};

export const updateDimensions = (node: Node, dimensions: Dimensions) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    const updateSpec = { [node.uuid]: { ui: { $merge: dimensions } } };
    dispatch(updateNodes(update(nodes, updateSpec)));
};

export const addNode = (node: Node, ui: UINode, pendingConnection?: DragPoint) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    console.time('addNode');
    const { flowContext: { nodes } } = getState();

    // Give our node a unique uuid
    const newNode = update(node, { $merge: { uuid: generateUUID() } });
    const updatedNodes = update(nodes, { $merge: { [newNode.uuid]: { node: newNode, ui } } });

    dispatch(updateNodes(updatedNodes));

    // Save our pending connection if we have one
    if (pendingConnection) {
        // prettier-ignore
        dispatch(
            updatePendingConnections(
                newNode.uuid,
                pendingConnection
            )
        );
    }

    dispatch(updateFreshestNode(newNode));
    console.timeEnd('addNode');
};

export const updateExitDestination = (nodeUUID: string, exitUUID: string, destination: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    const exits = nodes[nodeUUID].node.exits;

    console.log('updating exit', nodeUUID, exitUUID, destination);

    for (const exitIdx in exits) {
        if (exits[exitIdx].uuid === exitUUID) {
            const exit = exits[exitIdx];

            let updateSpec = {
                [nodeUUID]: {
                    node: {
                        exits: {
                            [exitIdx]: { $merge: { destination_node_uuid: destination } }
                        }
                    }
                }
            };

            // remove our old pointer if we have one
            if (exit.destination_node_uuid) {
                const nodeWePointTo = nodes[exit.destination_node_uuid];
                updateSpec = update(updateSpec, {
                    $merge: {
                        [exit.destination_node_uuid]: {
                            inboundConnections: {
                                $unset: [exit.uuid]
                            }
                        }
                    }
                });
            }

            // add our new pointer if we have one
            if (destination) {
                updateSpec = update(updateSpec, {
                    $merge: {
                        [destination]: {
                            inboundConnections: {
                                $merge: {
                                    [exit.uuid]: nodeUUID
                                }
                            }
                        }
                    }
                });
            }

            console.log(updateSpec);

            dispatch(updateNodes(update(nodes, updateSpec)));
            return;
        }
    }
};

export const disconnectExit = (nodeUUID: string, exitUUID: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => dispatch(updateExitDestination(nodeUUID, exitUUID, null));

export const updateConnection = (source: string, target: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const [nodeUUID, exitUUID] = source.split(':');
    if (nodeUUID === target) {
        console.error('Attempt to route to self, ignored...');
        return;
    }
    dispatch(updateExitDestination(nodeUUID, exitUUID, target));
};

export const resolvePendingConnection = (node: Node) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowEditor: { flowUI: { pendingConnections: currentPendingConnections } }
    } = getState();
    // Only resolve connection if we have one
    const pendingConnection = getPendingConnection(node.uuid, currentPendingConnections);
    if (pendingConnection) {
        // Remove our pending connection
        dispatch(removePendingConnection(node.uuid));
        dispatch(
            updateExitDestination(pendingConnection.nodeUUID, pendingConnection.exitUUID, node.uuid)
        );
    }
};

export const updateNode = (uuid: string, changes: any) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    console.log('changes', { [uuid]: changes });
    dispatch(updateNodes(update(nodes, { [uuid]: changes })));
    dispatch(markReflow());
};

export const ensureStartNode = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { flowContext: { nodes } } = getState();

    if (Object.keys(nodes).length === 0) {
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

export const removeNode = (node: Node) => (dispatch: DispatchWithState, getState: GetState) => {
    const { flowContext: { nodes } } = getState();

    // If we have a single exit, map all our pointers to that destination
    let updateSpec = {};

    let destination = null;
    if (node.exits.length === 1) {
        ({ destination_node_uuid: destination } = node.exits[0]);
    }

    // Re-map all our pointers to our new destination, null some most cases
    const renderNode = nodes[node.uuid];

    for (const fromExitUUID of Object.keys(renderNode.inboundConnections)) {
        // Don't allow it to point to ourselves
        let newDestination = destination;
        const fromNodeUUID = renderNode.inboundConnections[fromExitUUID];

        if (fromNodeUUID === destination) {
            newDestination = null;
        }

        const pointerExits = nodes[fromNodeUUID].node.exits;
        for (const exitIdx in pointerExits) {
            if (pointerExits[exitIdx].uuid === fromExitUUID) {
                updateSpec = prepUpdateDestination(
                    fromNodeUUID,
                    fromExitUUID,
                    exitIdx,
                    newDestination,
                    updateSpec
                );
            }
        }
    }

    // update remote pointers (the nodes we point to)
    for (const nodeUUID of getUniqueDestinations(node)) {
        const nodeWePointTo = nodes[nodeUUID];
        if (nodeWePointTo) {
            const toRemove = [];
            for (const fromExitUUID of Object.keys(nodeWePointTo.inboundConnections)) {
                const fromNodeUUID = nodeWePointTo.inboundConnections[fromExitUUID];
                if (fromNodeUUID === node.uuid) {
                    toRemove.push(fromExitUUID);
                }
            }

            if (updateSpec[nodeUUID]) {
                if (updateSpec[nodeUUID].inboundConnections) {
                    updateSpec = update(updateSpec, {
                        [nodeUUID]: { inboundConnections: { $merge: { $unset: toRemove } } }
                    });
                } else {
                    updateSpec = update(updateSpec, {
                        [nodeUUID]: { $merge: { inboundConnections: { $unset: toRemove } } }
                    });
                }
            } else {
                updateSpec = update(updateSpec, {
                    $merge: {
                        [nodeUUID]: { inboundConnections: { $unset: toRemove } }
                    }
                });
            }
        }
    }

    // Remove the node
    const newNodes = update(nodes, { $unset: [node.uuid] });
    dispatch(updateNodes(update(newNodes, updateSpec)));
    dispatch(ensureStartNode());
};

export const removeAction = (nodeUUID: string, action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    const renderNode = nodes[nodeUUID];

    // If it's our last action, then nuke the node
    if (renderNode.node.actions.length === 1) {
        dispatch(removeNode(renderNode.node));
    } else {
        // Otherwise, just splice out that action
        for (const actionIdx in renderNode.node.actions) {
            if (renderNode.node.actions[actionIdx].uuid === action.uuid) {
                dispatch(
                    updateNode(nodeUUID, {
                        node: { actions: { $splice: [[actionIdx, 1]] } }
                    })
                );
                break;
            }
        }
    }
};

export const moveActionUp = (nodeUUID: string, action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();

    const renderNode = nodes[nodeUUID];
    const actions = renderNode.node.actions;
    for (const idx in actions) {
        if (actions[idx].uuid === action.uuid) {
            const actionIdx = parseInt(idx, 10);
            const actionAbove = actions[actionIdx - 1];
            dispatch(
                updateNode(renderNode.node.uuid, {
                    node: { actions: { $splice: [[actionIdx - 1, 2, action, actionAbove]] } }
                })
            );
            return;
        }
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
    const { flowContext: { nodes }, nodeEditor: { userAddingAction, nodeToEdit } } = getState();

    if (draggedFrom && draggedFrom.nodeUUID !== nodeToEdit.uuid) {
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
    } else if (userAddingAction) {
        dispatch(updateNode(nodeToEdit.uuid, { node: { actions: { $push: [action] } } }));
    } else {
        if (nodeToEdit) {
            if (nodeToEdit.actions && nodeToEdit.actions.length > 0) {
                for (const actionIdx in nodeToEdit.actions) {
                    if (nodeToEdit.actions[actionIdx].uuid === action.uuid) {
                        dispatch(
                            updateNode(nodeToEdit.uuid, {
                                node: {
                                    actions: { [actionIdx]: { $set: action } }
                                }
                            })
                        );
                        break;
                    }
                }
            } else if (nodeToEdit.actions.length === 0) {
                dispatch(
                    updateNode(nodeToEdit.uuid, {
                        node: { actions: { $set: [action] } }
                    })
                );
            }

            let previousDestination = null;
            let previousUUID = generateUUID();
            if (nodeToEdit.exits.length === 1) {
                previousDestination = nodeToEdit.exits[0].destination_node_uuid;
                previousUUID = nodeToEdit.exits[0].uuid;
            }

            // make sure we don't have any routerness left
            updateNode(nodeToEdit.uuid, {
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
            });

            // TODO: not sure why we need this
            dispatch(updateFreshestNode(nodes[nodeToEdit.uuid].node));
        } else {
            // otherwise we might be adding a new action
            console.log("Couldn't find node, not updating");
            return;
        }
    }

    dispatch(updateUserAddingAction(false));
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
    const { flowContext: { nodes } } = getState();
    const renderNode = nodes[node.uuid];
    const previousNode = renderNode.node;

    let actionIdx = 0;
    for (const [idx, action] of previousNode.actions.entries()) {
        if (action.uuid === previousAction.uuid) {
            actionIdx = idx;
            break;
        }
    }

    // We need to splice a wait node where our previousAction was
    const topActions: Action[] = actionIdx > 0 ? [...previousNode.actions.slice(0, actionIdx)] : [];
    const bottomActions: Action[] = previousNode.actions.slice(
        actionIdx + 1,
        previousNode.actions.length
    );

    // const previousUI = getNodeUI(node.uuid, definition);
    const { x } = renderNode.ui.position;
    let { y } = renderNode.ui.position;

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
        const { flowEditor: { flowUI: { freshestNode } } } = getState();

        const topActionNode: Node = {
            uuid: generateUUID(),
            actions: topActions,
            exits: [
                {
                    uuid: generateUUID(),
                    destination_node_uuid: freshestNode.uuid
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
        const { flowEditor: { flowUI: { freshestNode } } } = getState();
        dispatch(
            updateExitDestination(freshestNode.uuid, freshestNode.exits[0].uuid, freshestNode.uuid)
        );
    } else {
        const { flowEditor: { flowUI: { freshestNode } } } = getState();
        dispatch(
            updateExitDestination(
                freshestNode.uuid,
                freshestNode.exits[0].uuid,
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
    const { flowContext: { nodes } } = getState();
    const renderNode = nodes[node.uuid];
    const previousNode = renderNode.node;
    const { position: { x, y } } = renderNode.ui;

    dispatch(
        addNode(node, {
            position: { x, y: y + NODE_SPACING },
            type
        })
    );

    // Rewire our old connections
    dispatch(
        updateExitDestination(
            previousNode.uuid,
            previousNode.exits[0].uuid,
            getState().flowEditor.flowUI.freshestNode.uuid
        )
    );

    // And our new node should point where the old one did
    const { destination_node_uuid: previousDestination } = previousNode.exits[0];
    const freshest = getState().flowEditor.flowUI.freshestNode;
    dispatch(updateExitDestination(freshest.uuid, freshest.exits[0].uuid, previousDestination));
};

export const updateRouter = (
    node: Node,
    type: string,
    draggedFrom: DragPoint = null,
    newPosition: Position = null,
    previousAction: Action = null
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { flowContext: { nodes } } = getState();

    console.time('updateRouter');

    const renderNode = nodes[node.uuid];
    if (!renderNode.node.router) {
        // Make sure our previous action exists in our map
        if (previousAction) {
            dispatch(spliceInRouter(node, type, previousAction));
        } else {
            dispatch(appendNewRouter(node, type));
        }
    } else {
        // Dragging from somewhere means we are a new node
        if (draggedFrom && draggedFrom.nodeUUID !== node.uuid) {
            const newNode = uniquifyNode(node);
            dispatch(addNode(newNode, { position: newPosition, type }));

            // Wire up where we dragged from
            dispatch(
                updateExitDestination(draggedFrom.nodeUUID, draggedFrom.exitUUID, newNode.uuid)
            );
        } else {
            // Otherwise we are updating an existing node
            dispatch(updateNode(node.uuid, { node: { $set: node }, ui: { $merge: { type } } }));
        }
    }

    console.timeEnd('updateRouter');
};

export const onNodeBeforeDrag = (
    node: Node,
    plumberSetDragSelection: Function,
    plumberClearDragSelection: Function
) => (dispatch: DispatchWithState, getState: GetState) => {
    const {
        flowContext: { nodes },
        flowEditor: { flowUI: { nodeDragging, dragGroup } }
    } = getState();

    if (nodeDragging) {
        if (dragGroup) {
            // TODO: replace this with drag selection
            const nodesBelow = getNodesBelow(node, nodes);
            plumberSetDragSelection(nodesBelow);
        } else {
            plumberClearDragSelection();
        }
    }
};

export const resetNodeEditingState = () => (dispatch: DispatchWithState, getState: GetState) => {
    const {
        flowEditor: { flowUI: { pendingConnection, createNodePosition } },
        nodeEditor: { actionToEdit, nodeToEdit }
    } = getState();

    dispatch(updateGhostNode(null));

    if (pendingConnection) {
        dispatch(updatePendingConnection(null));
    }

    if (createNodePosition) {
        dispatch(updateCreateNodePosition(null));
    }

    if (actionToEdit) {
        dispatch(updateActionToEdit(null));
    }

    if (nodeToEdit) {
        dispatch(updateNodeToEdit(null));
    }
};

export const onUpdateAction = (node: Node, action: AnyAction, repaintForDuration: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowEditor: { flowUI: { pendingConnection, createNodePosition } } } = getState();
    dispatch(updateAction(action, node.uuid, pendingConnection, createNodePosition));
    repaintForDuration();
};

export const onAddAction = (node: Node, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowContext: { definition },
        flowEditor: { editorUI: { translating, language } }
    } = getState();

    const newAction: SendMsg = {
        uuid: generateUUID(),
        type: 'send_msg',
        text: ''
    };

    dispatch(updateUserAddingAction(true));
    dispatch(updateActionToEdit(newAction));
    dispatch(updateNodeToEdit(node));

    const localizations = [];
    if (translating) {
        const translations = getTranslations(definition, language);
        localizations.push(
            // prettier-ignore
            ...getLocalizations(
                node,
                newAction,
                language.iso,
                languages,
                translations
            )
        );
    }

    const typeConfig = getTypeConfig(newAction.type);

    dispatch(updateLocalizations(localizations));
    dispatch(updateTypeConfig(typeConfig));
    dispatch(updateNodeDragging(false));
    dispatch(updateNodeEditorOpen(true));
};

export const onNodeEditorClose = (canceled: boolean, connectExit: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes }, flowEditor: { flowUI: { pendingConnection } } } = getState();

    // Make sure we re-wire the old connection
    if (canceled) {
        if (pendingConnection) {
            const renderNode = nodes[pendingConnection.nodeUUID];
            for (const exit of renderNode.node.exits) {
                if (exit.uuid === pendingConnection.exitUUID) {
                    connectExit(renderNode.node, exit);
                    break;
                }
            }
        }
    }

    dispatch(resetNodeEditingState());
};

export const onNodeMoved = (uuid: string, position: Position, repaintForDuration: Function) => (
    dispatch: DispatchWithState
) => {
    dispatch(updateNode(uuid, { ui: { position: { $set: position } } }));
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
    const { flowContext: { nodes } } = getState();

    // We finished dragging a ghost node, create the spec for our new ghost component
    const [fromNodeUUID, fromExitUUID] = event.sourceId.split(':');

    const fromNode = nodes[fromNodeUUID];
    const ghostNode = getGhostNode(fromNode, nodes);

    // Set our ghost spec so it gets rendered.
    // TODO: this is here to workaround a jsplumb
    // weirdness where offsets go off the handle upon
    // dragging connections.
    // window.setTimeout(() => dispatch(updateGhostNode(ghostNode)), 0);
    dispatch(updateGhostNode(ghostNode));

    // Save off our drag point for later
    dispatch(
        updatePendingConnection({
            nodeUUID: fromNodeUUID,
            exitUUID: event.sourceId
        })
    );
};

export const onUpdateRouter = (
    node: Node,
    type: string,
    repaintForDuration: Function,
    previousAction?: Action
) => (dispatch: DispatchWithState, getState: GetState) => {
    const { uuid: nodeUUID } = node;
    const {
        flowEditor: { flowUI: { pendingConnection, createNodePosition } },
        nodeEditor: { nodeToEdit: { uuid: newNodeUUID } }
    } = getState();

    dispatch(updateRouter(node, type, pendingConnection, createNodePosition, previousAction));

    if (nodeUUID !== newNodeUUID) {
        repaintForDuration();
    }

    dispatch(resetNodeEditingState());
};

export const onOpenNodeEditor = (node: Node, action: AnyAction, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowContext: { nodes, definition },
        flowEditor: { editorUI: { language, translating } }
    } = getState();

    const localizations = [];
    if (translating) {
        const translations = getTranslations(definition, language);
        localizations.push(
            ...getLocalizations(node, action, language.iso, languages, translations)
        );
    }

    if (action) {
        dispatch(updateActionToEdit(action));
    } else if (node.actions && node.actions.length) {
        // Account for hybrids or clicking on the empty exit table
        dispatch(updateActionToEdit(node.actions[node.actions.length - 1]));
    }

    const type = determineConfigType(node, action, nodes);
    dispatch(updateTypeConfig(getTypeConfig(type)));

    let resultName = '';

    if (node.router) {
        if (node.router.result_name) {
            ({ router: { result_name: resultName } } = node);
        }

        if (hasCases(node)) {
            const { operand } = node.router as SwitchRouter;
            dispatch(updateOperand(operand));
        }
    }

    dispatch(updateNodeDragging(false));
    dispatch(updateNodeToEdit(node));
    dispatch(updateLocalizations(localizations));
    dispatch(updateResultName(resultName));
    dispatch(updateShowResultName(resultName.length > 0));
    dispatch(updateNodeEditorOpen(true));
};
