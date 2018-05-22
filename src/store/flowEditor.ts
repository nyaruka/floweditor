// tslint:disable:no-shadowed-variable
import { combineReducers } from 'redux';

import { DragPoint } from '../component/Node';
import { FlowNode, FlowPosition } from '../flowTypes';
import { Asset } from '../services/AssetService';
import ActionTypes, {
    RemovePendingConnectionAction,
    UpdateCreateNodePositionAction,
    UpdateDragGroupAction,
    UpdateDragSelectionAction,
    UpdateFetchingFlowAction,
    UpdateGhostNodeAction,
    UpdateLanguageAction,
    UpdateNodeDraggingAction,
    UpdateNodeEditorOpenAction,
    UpdatePendingConnectionAction,
    UpdatePendingConnectionsAction,
    UpdateTranslatingAction
} from './actionTypes';
import Constants from './constants';

export interface DragSelection {
    startX?: number;
    startY?: number;
    currentX?: number;
    currentY?: number;
    selected?: { [uuid: string]: boolean };
}

export interface EditorUI {
    language: Asset;
    translating: boolean;
    fetchingFlow: boolean;
    nodeEditorOpen: boolean;
}

export interface FlowUI {
    createNodePosition: FlowPosition;
    pendingConnection: DragPoint;
    nodeDragging: boolean;
    ghostNode: FlowNode;
    dragGroup: boolean;
    dragSelection: DragSelection;
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
        nodeEditorOpen: false
    },
    flowUI: {
        createNodePosition: null,
        pendingConnection: null,
        nodeDragging: false,
        ghostNode: null,
        dragSelection: null,
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

export const updateLanguage = (language: Asset): UpdateLanguageAction => ({
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

export const updateCreateNodePosition = (
    createNodePosition: FlowPosition
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

export const updateDragSelection = (
    dragSelection: DragSelection
): UpdateDragSelectionAction => {
    return {
        type: Constants.UPDATE_DRAG_SELECTION,
        payload: {
            dragSelection
        }
    };
};

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

export const updateGhostNode = (ghostNode: FlowNode): UpdateGhostNodeAction => ({
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

/* Reducers */
// EditorUI reducers
export const language = (state: Asset = initialState.editorUI.language, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_LANGUAGE:
            return action.payload.language;
        default:
            return state;
    }
};

export const translating = (
    state: boolean = initialState.editorUI.translating,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_TRANSLATING:
            return action.payload.translating;
        default:
            return state;
    }
};

export const fetchingFlow = (
    state: boolean = initialState.editorUI.fetchingFlow,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_FETCHING_FLOW:
            return action.payload.fetchingFlow;
        default:
            return state;
    }
};

export const nodeEditorOpen = (
    state: boolean = initialState.editorUI.nodeEditorOpen,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_EDITOR_OPEN:
            return action.payload.nodeEditorOpen;
        default:
            return state;
    }
};

export const editorUI = combineReducers({
    language,
    translating,
    fetchingFlow,
    nodeEditorOpen
});

// FlowUI reducers
export const createNodePosition = (
    state: FlowPosition = initialState.flowUI.createNodePosition,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_CREATE_NODE_POSITION:
            return action.payload.createNodePosition;
        default:
            return state;
    }
};

export const pendingConnection = (
    state: DragPoint = initialState.flowUI.pendingConnection,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_PENDING_CONNECTION:
            return action.payload.pendingConnection;
        default:
            return state;
    }
};

export const nodeDragging = (
    state: boolean = initialState.flowUI.nodeDragging,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_DRAGGING:
            return action.payload.nodeDragging;
        default:
            return state;
    }
};

export const dragSelection = (
    state: DragSelection = initialState.flowUI.dragSelection,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_DRAG_SELECTION:
            return action.payload.dragSelection;
        default:
            return state;
    }
};

export const ghostNode = (state: FlowNode = initialState.flowUI.ghostNode, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_GHOST_NODE:
            return action.payload.ghostNode;
        default:
            return state;
    }
};

export const dragGroup = (state: boolean = initialState.flowUI.dragGroup, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_DRAG_GROUP:
            return action.payload.dragGroup;
        default:
            return state;
    }
};

export const flowUI = combineReducers({
    createNodePosition,
    pendingConnection,
    nodeDragging,
    ghostNode,
    dragSelection,
    dragGroup
});

// FlowEditor reducer
export default combineReducers({ editorUI, flowUI });
