// TODO: Remove use of Function
// tslint:disable:ban-types
import { Dispatch } from 'react-redux';
import { v4 as generateUUID } from 'uuid';
import { DragPoint } from '../component/Node';
import { hasCases } from '../component/NodeEditor/NodeEditor';
import { getTypeConfig } from '../config';
import { FlowDetails, getFlow, getFlows } from '../external';
import {
    Action,
    AnyAction,
    Dimensions,
    FlowDefinition,
    Languages,
    Node,
    Position,
    SendMsg,
    SwitchRouter
} from '../flowTypes';
import {
    RenderNode,
    updateDefinition,
    updateLocalizations,
    updateNodes,
    RenderNodeMap
} from './flowContext';
import {
    removePendingConnection,
    updateCreateNodePosition,
    updateFetchingFlow,
    updateFlows,
    updateGhostNode,
    updateNodeDragging,
    updateNodeEditorOpen,
    updatePendingConnection
} from './flowEditor';
import {
    determineConfigType,
    getCollision,
    getGhostNode,
    getLocalizations,
    getNodesBelow,
    getPendingConnection,
    getTranslations
} from './helpers';
import * as mutators from './mutators';
import {
    updateActionToEdit,
    updateNodeToEdit,
    updateOperand,
    updateResultName,
    updateShowResultName,
    updateTypeConfig,
    updateUserAddingAction
} from './nodeEditor';
import AppState from './state';

import * as variables from '../variables.scss';

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

const GRID_SIZE: number = parseInt(variables.grid_size, 10);
const NODE_SPACING: number = parseInt(variables.node_spacing, 10);
const NODE_PADDING: number = parseInt(variables.node_padding, 10);

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
    dispatch(updateDefinition(mutators.pruneDefinition(definition)));
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

export const reflow = (current: RenderNodeMap = null) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    let nodes = current;
    if (!nodes) {
        nodes = getState().flowContext.nodes;
    }

    const collision = getCollision(nodes);
    if (collision.length) {
        console.time('reflow');
        const [top, bottom, cascade] = collision;
        let updated = mutators.updatePosition(
            nodes,
            bottom.node.uuid,
            bottom.ui.position.left,
            top.ui.position.bottom + NODE_SPACING
        );

        if (cascade) {
            // start with the top of the bottom node
            let cascadeTop = top.ui.position.bottom + NODE_SPACING;

            // and add its height
            cascadeTop += bottom.ui.position.bottom - bottom.ui.position.top;

            updated = mutators.updatePosition(
                updated,
                cascade.node.uuid,
                cascade.ui.position.left,
                cascadeTop
            );
        }
        console.timeEnd('reflow');

        updated = dispatch(reflow(updated));
        if (current == null) {
            dispatch(updateNodes(updated));
        }
        return updated;
    }
    return nodes;
};

export const onUpdateLocalizations = (language: string, changes: LocalizationUpdates) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { definition } } = getState();
    dispatch(updateDefinition(mutators.updateLocalization(definition, language, changes)));
};

export const updateDimensions = (node: Node, dimensions: Dimensions) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    dispatch(updateNodes(mutators.updateDimensions(nodes, node.uuid, dimensions)));
    dispatch(reflow());
};

/**
 * @param renderNode Adds the given node, uniquifying its uuid
 */
export const addNode = (renderNode: RenderNode) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNode => {
    console.time('addNode');
    const { flowContext: { nodes } } = getState();
    renderNode.node = mutators.uniquifyNode(renderNode.node);
    dispatch(updateNodes(mutators.addNode(nodes, renderNode)));
    console.timeEnd('addNode');
    return renderNode;
};

export const updateExitDestination = (nodeUUID: string, exitUUID: string, destination: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    dispatch(updateNodes(mutators.updateConnection(nodes, nodeUUID, exitUUID, destination)));
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

        dispatch(addNode({ node, ui: { position: { left: 120, top: 120 } } }));
    }
};

export const removeNode = (node: Node) => (dispatch: DispatchWithState, getState: GetState) => {
    const { flowContext: { nodes } } = getState();
    const updatedNodes = mutators.removeNode(nodes, node.uuid);
    dispatch(updateNodes(updatedNodes));
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
        // Otherwise, just remove that action
        dispatch(updateNodes(mutators.removeAction(nodes, nodeUUID, action.uuid)));
    }
};

export const moveActionUp = (nodeUUID: string, action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    dispatch(updateNodes(mutators.moveActionUp(nodes, nodeUUID, action.uuid)));
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

    let updatedNodes = nodes;
    const creatingNewNode = draggedFrom && draggedFrom.nodeUUID !== nodeToEdit.uuid;

    if (creatingNewNode) {
        const newNode: RenderNode = {
            node: {
                uuid: generateUUID(),
                actions: [action],
                exits: [{ uuid: generateUUID(), destination_node_uuid: null, name: null }]
            },
            ui: { position: newPosition },
            inboundConnections: { [draggedFrom.exitUUID]: draggedFrom.nodeUUID }
        };

        updatedNodes = mutators.addNode(nodes, newNode);
    } else if (userAddingAction) {
        updatedNodes = mutators.addAction(nodes, nodeToEdit.uuid, action);
    } else {
        if (nodeToEdit) {
            updatedNodes = mutators.updateAction(nodes, nodeToEdit.uuid, action);
        } else {
            // otherwise we might be adding a new action
            console.log("Couldn't find node, not updating");
            return;
        }
    }

    dispatch(updateNodes(updatedNodes));
    dispatch(updateUserAddingAction(false));
    console.timeEnd('updateAction');
};

/**
 * Splices a router into a list of actions creating up to three nodes where there
 * was once one node.
 * @param nodeUUID the node to replace
 * @param node the new node being added (shares the previous node uuid)
 * @param type the type of the new router
 * @param previousAction the previous action that is being replaced with our router
 * @returns a list of RenderNodes that were created
 */
export const spliceInRouter = (
    nodeUUID: string,
    newRouterNode: Node,
    type: string,
    previousAction: Action
) => (dispatch: DispatchWithState, getState: GetState): RenderNode[] => {
    const { flowContext: { nodes } } = getState();
    const previousNode = nodes[nodeUUID];
    const result = [];

    // remove our node, we're going to replace with better ones
    let updatedNodes = nodes;

    let actionIdx = 0;
    for (const [idx, action] of previousNode.node.actions.entries()) {
        if (action.uuid === previousAction.uuid) {
            actionIdx = idx;
            break;
        }
    }

    // we need to splice a wait node where our previousAction was
    const topActions: Action[] =
        actionIdx > 0 ? [...previousNode.node.actions.slice(0, actionIdx)] : [];
    const bottomActions: Action[] = previousNode.node.actions.slice(
        actionIdx + 1,
        previousNode.node.actions.length
    );

    // tslint:disable-next-line:prefer-const
    let { left, top } = previousNode.ui.position;

    let topNode: RenderNode;
    let bottomNode: RenderNode;

    const routerNode: RenderNode = {
        node: newRouterNode,
        ui: { position: { left, top }, type }
    };

    // add our top node if we have one
    if (topActions.length > 0) {
        topNode = {
            node: {
                uuid: generateUUID(),
                actions: topActions,
                exits: [
                    {
                        uuid: generateUUID(),
                        destination_node_uuid: null
                    }
                ]
            },
            ui: { position: { left, top } }
        };
        updatedNodes = mutators.addNode(updatedNodes, topNode);
        top += NODE_SPACING;

        // update our routerNode for the presence of a top node
        routerNode.inboundConnections = { [topNode.node.exits[0].uuid]: topNode.node.uuid };
        routerNode.ui.position.top += NODE_SPACING;

        result.push(topNode);
    }

    // now add our routerNode
    updatedNodes = mutators.addNode(updatedNodes, routerNode);
    result.push(routerNode);

    // add our bottom
    if (bottomActions.length > 0) {
        bottomNode = {
            node: {
                uuid: generateUUID(),
                actions: bottomActions,
                exits: [
                    {
                        uuid: generateUUID(),
                        destination_node_uuid: previousNode.node.exits[0].destination_node_uuid
                    }
                ]
            },
            ui: {
                position: { left, top }
            },
            inboundConnections: { [routerNode.node.exits[0].uuid]: routerNode.node.uuid }
        };
        updatedNodes = mutators.addNode(updatedNodes, bottomNode);
        result.push(bottomNode);
    } else {
        // if we don't have a bottom, route our routerNode to the previous destination
        updatedNodes = mutators.updateConnection(
            updatedNodes,
            routerNode.node.uuid,
            routerNode.node.exits[0].uuid,
            previousNode.node.exits[0].destination_node_uuid
        );
    }

    // remove our old node, we have better ones now
    updatedNodes = mutators.removeNode(updatedNodes, previousNode.node.uuid);

    dispatch(updateNodes(updatedNodes));
    return result;
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
    const { position: { left, top } } = renderNode.ui;

    const addedNode = dispatch(
        addNode({
            node,
            ui: {
                position: { left, top: top + NODE_SPACING },
                type
            }
        })
    );

    // Rewire our old connections
    dispatch(
        updateExitDestination(previousNode.uuid, previousNode.exits[0].uuid, addedNode.node.uuid)
    );

    // And our new node should point where the old one did
    const { destination_node_uuid: previousDestination } = previousNode.exits[0];
    dispatch(
        updateExitDestination(
            addedNode.node.uuid,
            addedNode.node.exits[0].uuid,
            previousDestination
        )
    );
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
    if (renderNode && !renderNode.node.router) {
        // Make sure our previous action exists in our map
        if (previousAction) {
            dispatch(spliceInRouter(node.uuid, mutators.uniquifyNode(node), type, previousAction));
        } else {
            dispatch(appendNewRouter(node, type));
        }
    } else {
        // Dragging from somewhere means we are a new node
        if (draggedFrom && draggedFrom.nodeUUID !== node.uuid) {
            dispatch(
                addNode({
                    node,
                    ui: { position: newPosition, type },
                    inboundConnections: {
                        [draggedFrom.exitUUID]: draggedFrom.nodeUUID
                    }
                })
            );
        } else {
            // Otherwise we are updating an existing node
            dispatch(updateNodes(mutators.updateNode(nodes, node, type)));
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

export const onNodeMoved = (nodeUUID: string, position: Position, repaintForDuration: Function) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { nodes } } = getState();
    dispatch(updateNodes(mutators.updatePosition(nodes, nodeUUID, position.left, position.top)));
    dispatch(reflow());
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
            exitUUID: event.sourceId.split(':')[1]
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
