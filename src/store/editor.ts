import { FlowPosition } from '~/flowTypes';
import ActionTypes, { UpdateEditorState } from '~/store/actionTypes';
import Constants from '~/store/constants';
import { Asset, RenderNode } from '~/store/flowContext';

// tslint:disable:no-shadowed-variable
export interface DragSelection {
    startX?: number;
    startY?: number;
    currentX?: number;
    currentY?: number;
}

export interface DebugState {
    showUUIDs: boolean;
}

export interface CanvasPositions {
    [uuid: string]: FlowPosition;
}

export interface Activity {
    nodes: { [uuid: string]: number };
    segments: { [exitToNodeKey: string]: number };
}

export interface RecentMessage {
    sent: string;
    text: string;
}

export interface EditorState {
    simulating: boolean;
    language: Asset;
    translating: boolean;
    fetchingFlow: boolean;
    ghostNode: RenderNode;
    containerOffset: { left: number; top: number };
    dragActive: boolean;
    dragStartTime: number;
    dragDownPosition: FlowPosition;
    dragNodeUUID: string;
    dragGroup: boolean;
    dragSelection: DragSelection;
    debug?: DebugState;

    // the currently shown activity, can be
    // simulation or live
    activity: Activity;

    // the current live activity
    liveActivity: Activity;

    // interval in millis we should refresh activity
    activityInterval: number;

    // is our page visible or tabbed away
    visible: boolean;
}

export const EMPTY_DRAG_STATE: any = {
    dragStartTime: 0,
    dragDownPosition: null,
    dragActive: false,
    dragNodeUUID: null,
    dragGroup: false,
    dragSelection: null
};

// Initial state
export const initialState: EditorState = {
    containerOffset: { top: 0, left: 0 },
    simulating: false,
    translating: false,
    language: null,
    fetchingFlow: false,
    dragStartTime: 0,
    dragDownPosition: null,
    dragActive: false,
    dragNodeUUID: null,
    dragGroup: false,
    dragSelection: null,
    ghostNode: null,
    debug: null,

    activity: { segments: {}, nodes: {} },
    liveActivity: { segments: {}, nodes: {} },
    activityInterval: 5000,
    visible: true
};

// Action Creator
export const updateEditorState = (editorState: EditorState): UpdateEditorState => ({
    type: Constants.UPDATE_EDITOR_STATE,
    payload: {
        editorState
    }
});

/* Reducer */
export const editorState = (editorState: EditorState = initialState, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_EDITOR_STATE:
            return action.payload.editorState;
        default:
            return editorState;
    }
};

// export our reducer
export default editorState;
