import { combineReducers } from 'redux';
import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { Node, Position } from '../flowTypes';
import ActionTypes, {
    RemovePendingConnectionAction,
    UpdateCreateNodePositionAction,
    UpdateDragGroupAction,
    UpdateFetchingFlowAction,
    UpdateFlowsAction,
    UpdateFreshestNodeAction,
    UpdateGhostNodeAction,
    UpdateLanguageAction,
    UpdateNodeDraggingAction,
    UpdateNodeEditorOpenAction,
    UpdatePendingConnectionAction,
    UpdatePendingConnectionsAction,
    UpdateTranslatingAction
} from './actionTypes';
import Constants from './constants';

export type Flows = Array<{ uuid: string; name: string }>;

export interface PendingConnections {
    [uuid: string]: DragPoint;
}

export interface EditorUI {
    language: Language;
    translating: boolean;
    fetchingFlow: boolean;
    nodeEditorOpen: boolean;
    flows: Flows;
}

export interface FlowUI {
    createNodePosition: Position;
    pendingConnection: DragPoint;
    pendingConnections: PendingConnections;
    freshestNode: Node;
    nodeDragging: boolean;
    ghostNode: Node;
    dragGroup: boolean;
}

export interface FlowEditor {
    editorUI: EditorUI;
    flowUI: FlowUI;
}

// Initial state
export const initialState: FlowEditor = {
    editorUI: {
        translating: false,
        language: null,
        fetchingFlow: false,
        nodeEditorOpen: false,
        flows: []
    },
    flowUI: {
        createNodePosition: null,
        pendingConnection: null,
        pendingConnections: {},
        freshestNode: null,
        nodeDragging: false,
        ghostNode: null,
        dragGroup: false
    }
};

// Action Creators
export const updateTranslating = (translating: boolean): UpdateTranslatingAction => ({
    type: Constants.UPDATE_TRANSLATING,
    payload: {
        translating
    }
});

export const updateLanguage = (language: Language): UpdateLanguageAction => ({
    type: Constants.UPDATE_LANGUAGE,
    payload: {
        language
    }
});

export const updateFetchingFlow = (fetchingFlow: boolean): UpdateFetchingFlowAction => ({
    type: Constants.UPDATE_FETCHING_FLOW,
    payload: {
        fetchingFlow
    }
});

export const updateNodeEditorOpen = (nodeEditorOpen: boolean): UpdateNodeEditorOpenAction => ({
    type: Constants.UPDATE_NODE_EDITOR_OPEN,
    payload: {
        nodeEditorOpen
    }
});

export const updateFlows = (flows: Flows): UpdateFlowsAction => ({
    type: Constants.UPDATE_FLOWS,
    payload: {
        flows
    }
});

export const updateCreateNodePosition = (
    createNodePosition: Position
): UpdateCreateNodePositionAction => ({
    type: Constants.UPDATE_CREATE_NODE_POSITION,
    payload: {
        createNodePosition
    }
});

export const updatePendingConnection = (
    pendingConnection: DragPoint
): UpdatePendingConnectionAction => ({
    type: Constants.UPDATE_PENDING_CONNECTION,
    payload: {
        pendingConnection
    }
});

export const updatePendingConnections = (
    draggedTo: string,
    draggedFrom: DragPoint
): UpdatePendingConnectionsAction => ({
    type: Constants.UPDATE_PENDING_CONNECTIONS,
    payload: {
        draggedTo,
        draggedFrom
    }
});

export const removePendingConnection = (nodeUUID: string): RemovePendingConnectionAction => ({
    type: Constants.REMOVE_PENDING_CONNECTION,
    payload: {
        nodeUUID
    }
});

export const updateFreshestNode = (freshestNode: Node): UpdateFreshestNodeAction => ({
    type: Constants.UPDATE_FRESHEST_NODE,
    payload: {
        freshestNode
    }
});

export const updateGhostNode = (ghostNode: Node): UpdateGhostNodeAction => ({
    type: Constants.UPDATE_GHOST_NODE,
    payload: {
        ghostNode
    }
});

export const updateNodeDragging = (nodeDragging: boolean): UpdateNodeDraggingAction => ({
    type: Constants.UPDATE_NODE_DRAGGING,
    payload: {
        nodeDragging
    }
});

export const updateDragGroup = (dragGroup: boolean): UpdateDragGroupAction => ({
    type: Constants.UPDATE_DRAG_GROUP,
    payload: {
        dragGroup
    }
});

// Reducers
export const editorUI = (state: EditorUI = initialState.editorUI, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_LANGUAGE:
            return {
                ...state,
                language: action.payload.language
            };
        case Constants.UPDATE_TRANSLATING:
            return {
                ...state,
                translating: action.payload.translating
            };
        case Constants.UPDATE_FETCHING_FLOW:
            return {
                ...state,
                fetchingFlow: action.payload.fetchingFlow
            };
        case Constants.UPDATE_FLOWS:
            return {
                ...state,
                flows: action.payload.flows
            };
        case Constants.UPDATE_NODE_EDITOR_OPEN:
            return {
                ...state,
                nodeEditorOpen: action.payload.nodeEditorOpen
            };
        default:
            return state;
    }
};

export const flowUI = (state: FlowUI = initialState.flowUI, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_CREATE_NODE_POSITION:
            return {
                ...state,
                createNodePosition: action.payload.createNodePosition
            };
        case Constants.UPDATE_PENDING_CONNECTION:
            return {
                ...state,
                pendingConnection: action.payload.pendingConnection
            };
        case Constants.UPDATE_PENDING_CONNECTIONS:
            return {
                ...state,
                pendingConnections: {
                    ...state.pendingConnections,
                    [action.payload.draggedTo]: action.payload.draggedFrom
                }
            };
        case Constants.REMOVE_PENDING_CONNECTION:
            const pendingConnections = { ...state.pendingConnections };
            delete pendingConnections[action.payload.nodeUUID];
            return {
                ...state,
                pendingConnections
            };
        case Constants.UPDATE_NODE_DRAGGING:
            return {
                ...state,
                nodeDragging: action.payload.nodeDragging
            };
        case Constants.UPDATE_FRESHEST_NODE:
            return {
                ...state,
                freshestNode: action.payload.freshestNode
            };
        case Constants.UPDATE_GHOST_NODE:
            return {
                ...state,
                ghostNode: action.payload.ghostNode
            };
        case Constants.UPDATE_DRAG_GROUP:
            return {
                ...state,
                dragGroup: action.payload.dragGroup
            };
        default:
            return state;
    }
};

export default combineReducers({ editorUI, flowUI });
