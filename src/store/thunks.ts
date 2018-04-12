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
    FlowNode,
    FlowPosition,
    SendMsg,
    SwitchRouter,
    Exit,
    StickyNote
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
    updatePendingConnection,
    updateDragSelection
} from './flowEditor';
import {
    determineConfigType,
    getCollision,
    getGhostNode,
    getLocalizations,
    getActionIndex
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
import { NODE_SPACING, dump } from '../utils';

import { timeStart, timeEnd } from '../testUtils';
import Plumber from '../services/Plumber';

export type DispatchWithState = Dispatch<AppState>;

export type GetState = () => AppState;

export type Thunk<T> = (dispatch: DispatchWithState, getState?: GetState) => T;

export type AsyncThunk = Thunk<Promise<void>>;

export type OnAddToNode = (node: FlowNode) => Thunk<void>;

export type OnResetDragSelection = () => Thunk<void>;

export type OnNodeMoved = (uuid: string, position: FlowPosition) => Thunk<RenderNodeMap>;

export type OnOpenNodeEditor = (
    node: FlowNode,
    action: AnyAction,
    languages: Languages
) => Thunk<void>;

export type RemoveNode = (nodeToRemove: FlowNode) => Thunk<RenderNodeMap>;

export type UpdateDimensions = (node: FlowNode, dimensions: Dimensions) => Thunk<RenderNodeMap>;

export type FetchFlow = (endpoint: string, uuid: string) => AsyncThunk;

export type FetchFlows = (endpoint: string) => AsyncThunk;

export type EnsureStartNode = () => Thunk<RenderNode>;

export type NoParamsAC = () => Thunk<void>;

export type UpdateConnection = (source: string, target: string) => Thunk<RenderNodeMap>;

export type OnConnectionDrag = (event: ConnectionEvent) => Thunk<void>;

export type OnUpdateLocalizations = (
    language: string,
    changes: LocalizationUpdates
) => Thunk<FlowDefinition>;

export type UpdateSticky = (stickyUUID: string, sticky: StickyNote) => Thunk<void>;

export type OnUpdateAction = (action: AnyAction) => Thunk<RenderNodeMap>;

export type ActionAC = (nodeUUID: string, action: AnyAction) => Thunk<RenderNodeMap>;

export type DisconnectExit = (nodeUUID: string, exitUUID: string) => Thunk<RenderNodeMap>;

export interface ReplaceAction {
    nodeUUID: string;
    actionUUID: string;
}

export type OnUpdateRouter = (node: RenderNode) => Thunk<RenderNodeMap>;

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
const QUIET_REFLOW = 200;

let debounceReflow: any = null;

export const initializeFlow = (definition: FlowDefinition) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const nodes: { [uuid: string]: RenderNode } = {};
    const exits: { [uuid: string]: string } = {};

    // initialize our nodes
    const pointerMap: { [uuid: string]: { [uuid: string]: string } } = {};
    for (const node of definition.nodes) {
        if (!node.actions) {
            node.actions = [];
        }
        nodes[node.uuid] = { node, ui: definition._ui.nodes[node.uuid], inboundConnections: {} };

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
    return nodes;
};

export const fetchFlow = (endpoint: string, uuid: string) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    dispatch(updateFetchingFlow(true));
    return (
        getFlow(endpoint, uuid, false)
            .then(({ definition }: FlowDetails) => {
                return dispatch(initializeFlow(definition));
            })
            // TODO: think this should probably bubble up
            .catch(
                /* istanbul ignore next */ (error: any) => console.log(`fetchFlow error: ${error}`)
            )
    );
};

export const fetchFlows = (endpoint: string) => (dispatch: DispatchWithState) =>
    getFlows(endpoint)
        .then((flows: FlowDetails[]) => {
            return dispatch(
                updateFlows(
                    flows.map(({ uuid, name }) => ({
                        uuid,
                        name
                    }))
                )
            );
        })
        // TODO: think this should probably bubble up
        .catch(
            /* istanbul ignore next */ (error: any) => console.log(`fetchFlowList error: ${error}`)
        );

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
        timeStart('reflow');

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

        timeEnd('reflow');

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
): FlowDefinition => {
    const { flowContext: { definition } } = getState();
    const updated = mutators.updateLocalization(definition, language, changes);
    dispatch(updateDefinition(updated));
    return updated;
};

export const updateDimensions = (node: FlowNode, dimensions: Dimensions) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const { flowContext: { nodes } } = getState();
    const updated = mutators.updateDimensions(nodes, node.uuid, dimensions);
    dispatch(updateNodes(updated));
    markReflow(dispatch);
    return updated;
};

/**
 * @param renderNode Adds the given node, uniquifying its uuid
 */
export const addNode = (renderNode: RenderNode) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNode => {
    timeStart('addNode');
    const { flowContext: { nodes } } = getState();
    renderNode.node = mutators.uniquifyNode(renderNode.node);
    dispatch(updateNodes(mutators.mergeNode(nodes, renderNode)));
    timeEnd('addNode');
    return renderNode;
};

export const updateExitDestination = (nodeUUID: string, exitUUID: string, destination: string) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const { flowContext: { nodes } } = getState();
    const updated = mutators.updateConnection(nodes, nodeUUID, exitUUID, destination);
    dispatch(updateNodes(updated));
    return updated;
};

export const disconnectExit = (nodeUUID: string, exitUUID: string) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => dispatch(updateExitDestination(nodeUUID, exitUUID, null));

export const updateConnection = (source: string, target: string) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const [nodeUUID, exitUUID] = source.split(':');
    return dispatch(updateExitDestination(nodeUUID, exitUUID, target));
};

export const ensureStartNode = () => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNode => {
    const { flowContext: { nodes } } = getState();

    if (Object.keys(nodes).length === 0) {
        const initialAction: SendMsg = {
            uuid: generateUUID(),
            type: 'send_msg',
            text: 'Hi there, this is the first message in your flow.'
        };

        const node: FlowNode = {
            uuid: generateUUID(),
            actions: [initialAction],
            exits: [
                {
                    uuid: generateUUID()
                }
            ]
        };

        return dispatch(
            addNode({
                node,
                ui: { position: { left: 120, top: 120 } },
                inboundConnections: {}
            })
        );
    }
};

export const removeNode = (node: FlowNode) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const { flowContext: { nodes } } = getState();
    const updated = mutators.removeNodeAndRemap(nodes, node.uuid);
    dispatch(updateNodes(updated));
    return updated;
};

export const removeAction = (nodeUUID: string, action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const { flowContext: { nodes } } = getState();
    const renderNode = nodes[nodeUUID];

    // If it's our last action, then nuke the node
    if (renderNode.node.actions.length === 1) {
        return dispatch(removeNode(renderNode.node));
    } else {
        // Otherwise, just remove that action
        const updated = mutators.removeAction(nodes, nodeUUID, action.uuid);
        dispatch(updateNodes(updated));
        return updated;
    }
};

export const moveActionUp = (nodeUUID: string, action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const { flowContext: { nodes } } = getState();
    const updated = mutators.moveActionUp(nodes, nodeUUID, action.uuid);
    dispatch(updateNodes(updated));
    return updated;
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
    newRouterNode: RenderNode,
    previousAction: { nodeUUID: string; actionUUID: string }
) => (dispatch: DispatchWithState, getState: GetState): RenderNodeMap => {
    const { flowContext: { nodes } } = getState();
    const previousNode = nodes[previousAction.nodeUUID];

    newRouterNode.node = mutators.uniquifyNode(newRouterNode.node);

    let updatedNodes = nodes;
    const actionIdx = getActionIndex(previousNode.node, previousAction.actionUUID);

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
            ui: { position: { left, top } },
            inboundConnections: { ...previousNode.inboundConnections }
        };

        updatedNodes = mutators.mergeNode(updatedNodes, topNode);
        top += NODE_SPACING;

        // update our routerNode for the presence of a top node
        newRouterNode.inboundConnections = { [topNode.node.exits[0].uuid]: topNode.node.uuid };
        newRouterNode.ui.position.top += NODE_SPACING;
    } else {
        newRouterNode.inboundConnections = { ...previousNode.inboundConnections };
    }

    // now add our routerNode
    updatedNodes = mutators.mergeNode(updatedNodes, newRouterNode);

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
            inboundConnections: { [newRouterNode.node.exits[0].uuid]: newRouterNode.node.uuid }
        };
        updatedNodes = mutators.mergeNode(updatedNodes, bottomNode);
    } else {
        // if we don't have a bottom, route our routerNode to the previous destination
        updatedNodes = mutators.updateConnection(
            updatedNodes,
            newRouterNode.node.uuid,
            newRouterNode.node.exits[0].uuid,
            previousNode.node.exits[0].destination_node_uuid
        );
    }

    // remove our old node, we have better ones now
    updatedNodes = mutators.removeNode(updatedNodes, previousNode.node.uuid);
    dispatch(updateNodes(updatedNodes));
    return updatedNodes;
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

export const onUpdateAction = (action: AnyAction) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowEditor: { flowUI: { pendingConnection, createNodePosition } },
        nodeEditor: { userAddingAction, nodeToEdit },
        flowContext: { nodes }
    } = getState();

    timeStart('onUpdateAction');

    if (nodeToEdit == null) {
        throw new Error('Need nodeToEdit in state to update an action');
    }

    let updatedNodes = nodes;
    const creatingNewNode = pendingConnection && pendingConnection.nodeUUID !== nodeToEdit.uuid;

    if (creatingNewNode) {
        const newNode: RenderNode = {
            node: {
                uuid: generateUUID(),
                actions: [action],
                exits: [{ uuid: generateUUID(), destination_node_uuid: null, name: null }]
            },
            ui: { position: createNodePosition },
            inboundConnections: { [pendingConnection.exitUUID]: pendingConnection.nodeUUID }
        };

        updatedNodes = mutators.mergeNode(nodes, newNode);
    } else if (userAddingAction) {
        updatedNodes = mutators.addAction(nodes, nodeToEdit.uuid, action);
    } else {
        updatedNodes = mutators.updateAction(nodes, nodeToEdit.uuid, action);
    }

    timeEnd('onUpdateAction');
    dispatch(updateNodes(updatedNodes));
    dispatch(updateUserAddingAction(false));
    return updatedNodes;
};

/**
 * Opens the NodeEditor in the state for adding to a provided node
 * @param node the node to add to
 */
export const onAddToNode = (node: FlowNode) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const { flowContext: { definition }, flowEditor: { editorUI: { language } } } = getState();

    const newAction: SendMsg = {
        uuid: generateUUID(),
        type: 'send_msg',
        text: ''
    };

    dispatch(updateUserAddingAction(true));
    dispatch(updateActionToEdit(newAction));
    dispatch(updateNodeToEdit(node));
    dispatch(updateLocalizations([]));
    dispatch(updateTypeConfig(getTypeConfig(newAction.type)));
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
                /* istanbul ignore else */
                if (exit.uuid === pendingConnection.exitUUID) {
                    connectExit(renderNode.node, exit);
                    break;
                }
            }
        }
    }

    dispatch(resetNodeEditingState());
};

export const onResetDragSelection = () => (dispatch: DispatchWithState, getState: GetState) => {
    const { flowEditor: { flowUI: { dragSelection } } } = getState();
    if (dragSelection && dragSelection.selected) {
        dispatch(updateDragSelection({ selected: null }));
    }
};

export const onNodeMoved = (nodeUUID: string, position: FlowPosition) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const { flowContext: { nodes }, flowEditor: { flowUI: { dragSelection } } } = getState();

    if (dragSelection && dragSelection.selected) {
        dispatch(updateDragSelection({ selected: null }));
    }

    const updated = mutators.updatePosition(nodes, nodeUUID, position.left, position.top);
    dispatch(updateNodes(updated));
    markReflow(dispatch);
    return updated;
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
    dispatch(updateGhostNode(ghostNode));

    // Save off our drag point for later
    dispatch(
        updatePendingConnection({
            nodeUUID: fromNodeUUID,
            exitUUID: event.sourceId.split(':')[1]
        })
    );
};

export const updateSticky = (uuid: string, sticky: StickyNote) => (
    dispatch: DispatchWithState,
    getState: GetState
): void => {
    const { flowContext: { definition } } = getState();

    const updated = mutators.updateStickyNote(definition, uuid, sticky);
    dispatch(updateDefinition(updated));
};

export const onUpdateRouter = (node: RenderNode) => (
    dispatch: DispatchWithState,
    getState: GetState
): RenderNodeMap => {
    const {
        flowContext: { nodes },
        flowEditor: { flowUI: { pendingConnection, createNodePosition } },
        nodeEditor: { nodeToEdit, actionToEdit }
    } = getState();

    const previousNode = nodes[nodeToEdit.uuid];

    let updated = nodes;
    if (createNodePosition) {
        node.ui.position = createNodePosition;
    } else {
        const previousPosition = previousNode.ui.position;
        node.ui.position = {
            left: previousPosition.left,
            top: previousPosition.top
        };
    }

    if (pendingConnection) {
        node.inboundConnections = { [pendingConnection.exitUUID]: pendingConnection.nodeUUID };
        node.node = mutators.uniquifyNode(node.node);
    }

    if (nodeToEdit && actionToEdit) {
        const actionToSplice = previousNode.node.actions.find(
            (action: Action) => action.uuid === actionToEdit.uuid
        );

        if (actionToSplice) {
            // if we are splicing using the original top
            node.ui.position.top = previousNode.ui.position.top;

            return dispatch(
                spliceInRouter(node, {
                    nodeUUID: previousNode.node.uuid,
                    actionUUID: actionToSplice.uuid
                })
            );
        }

        // don't recognize that action, let's add a new router node
        const router = node.node.router as SwitchRouter;
        const exitToUpdate = node.node.exits.find(
            (exit: Exit) => exit.uuid === router.default_exit_uuid
        );

        exitToUpdate.destination_node_uuid = previousNode.node.exits[0].destination_node_uuid;

        node.inboundConnections = { [previousNode.node.exits[0].uuid]: previousNode.node.uuid };
        node.node = mutators.uniquifyNode(node.node);
        node.ui.position.top = previousNode.ui.position.bottom;
        updated = mutators.mergeNode(updated, node);
    } else {
        updated = mutators.mergeNode(updated, node);
    }

    dispatch(updateNodes(updated));

    return updated;
};

/**
 * Debounce for triggered reflows
 */
const markReflow = (dispatch: DispatchWithState) => {
    if (debounceReflow) {
        window.clearTimeout(debounceReflow);
    }

    debounceReflow = window.setTimeout(
        /* istanbul ignore next */ () => {
            dispatch(reflow());
        },
        QUIET_REFLOW
    );
};

export const onOpenNodeEditor = (node: FlowNode, action: AnyAction, languages: Languages) => (
    dispatch: DispatchWithState,
    getState: GetState
) => {
    const {
        flowContext: { nodes, definition: { localization } },
        flowEditor: { editorUI: { language, translating } }
    } = getState();

    const localizations = [];

    if (translating) {
        let actionToTranslate = action;

        // if they clicked just below the actions, treat it as the last action
        if (!actionToTranslate && node.actions.length > 0) {
            actionToTranslate = node.actions[node.actions.length - 1];

            // only send_msg actions are localizable
            if (actionToTranslate.type !== 'send_msg') {
                return;
            }
        }

        const translations = localization[language.iso];
        localizations.push(
            ...getLocalizations(node, actionToTranslate, language.iso, languages, translations)
        );
    }

    if (action) {
        dispatch(updateActionToEdit(action));
    } else if (node.actions.length > 0) {
        // Account for hybrids or clicking on the empty exit table
        dispatch(updateActionToEdit(node.actions[node.actions.length - 1]));
    }

    const type = determineConfigType(node, action, nodes);
    dispatch(updateTypeConfig(getTypeConfig(type)));

    let resultName = '';

    if (node.router) {
        /* istanbul ignore else */
        if (node.router.result_name) {
            ({ router: { result_name: resultName } } = node);
        }

        /* istanbul ignore else */
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
