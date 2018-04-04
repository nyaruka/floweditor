import { combineReducers } from 'redux';
import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { FlowNode, Position } from '../flowTypes';
import ActionTypes, {
    RemovePendingConnectionAction,
    UpdateCreateNodePositionAction,
    UpdateDragGroupAction,
    UpdateFetchingFlowAction,
    UpdateFlowsAction,
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
    nodeDragging: boolean;
    ghostNode: FlowNode;
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
        nodeDragging: false,
        ghostNode: null,
        dragGroup: false
    }
};

// Action Creators
// tslint:disable-next-line:no-shadowed-variable
export const updateTranslating = (translating: boolean): UpdateTranslatingAction => ({
    type: Constants.UPDATE_TRANSLATING,
    payload: {
        translating
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateLanguage = (language: Language): UpdateLanguageAction => ({
    type: Constants.UPDATE_LANGUAGE,
    payload: {
        language
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateFetchingFlow = (fetchingFlow: boolean): UpdateFetchingFlowAction => ({
    type: Constants.UPDATE_FETCHING_FLOW,
    payload: {
        fetchingFlow
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateNodeEditorOpen = (nodeEditorOpen: boolean): UpdateNodeEditorOpenAction => ({
    type: Constants.UPDATE_NODE_EDITOR_OPEN,
    payload: {
        nodeEditorOpen
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateFlows = (flows: Flows): UpdateFlowsAction => ({
    type: Constants.UPDATE_FLOWS,
    payload: {
        flows
    }
});

export const updateCreateNodePosition = (
    // tslint:disable-next-line:no-shadowed-variable
    createNodePosition: Position
): UpdateCreateNodePositionAction => ({
    type: Constants.UPDATE_CREATE_NODE_POSITION,
    payload: {
        createNodePosition
    }
});

export const updatePendingConnection = (
    // tslint:disable-next-line:no-shadowed-variable
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

// tslint:disable-next-line:no-shadowed-variable
export const updateGhostNode = (ghostNode: FlowNode): UpdateGhostNodeAction => ({
    type: Constants.UPDATE_GHOST_NODE,
    payload: {
        ghostNode
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateNodeDragging = (nodeDragging: boolean): UpdateNodeDraggingAction => ({
    type: Constants.UPDATE_NODE_DRAGGING,
    payload: {
        nodeDragging
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateDragGroup = (dragGroup: boolean): UpdateDragGroupAction => ({
    type: Constants.UPDATE_DRAG_GROUP,
    payload: {
        dragGroup
    }
});

/* Reducers */
// EditorUI reducers
export const language = (state: Language = initialState.editorUI.language, action: ActionTypes) => {
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

export const flows = (state: Flows = initialState.editorUI.flows, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_FLOWS:
            return action.payload.flows;
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
    flows,
    nodeEditorOpen
});

// FlowUI reducers
export const createNodePosition = (
    state: Position = initialState.flowUI.createNodePosition,
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

export const pendingConnections = (
    state: PendingConnections = initialState.flowUI.pendingConnections,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_PENDING_CONNECTIONS:
            return {
                ...state,
                [action.payload.draggedTo]: action.payload.draggedFrom
            };
        case Constants.REMOVE_PENDING_CONNECTION:
            const newPendingConnections = { ...pendingConnections };
            delete newPendingConnections[action.payload.nodeUUID];
            return newPendingConnections;
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
    pendingConnections,
    nodeDragging,
    ghostNode,
    dragGroup
});

// FlowEditor reducer
export default combineReducers({ editorUI, flowUI });
