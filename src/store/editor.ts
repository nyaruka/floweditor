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

export interface EditorState {
    language: Asset;
    translating: boolean;
    fetchingFlow: boolean;
    ghostNode: RenderNode;
    dragActive: boolean;
    dragStartTime: number;
    dragDownPosition: FlowPosition;
    dragNodeUUID: string;
    dragGroup: boolean;
    dragSelection: DragSelection;
    debug?: DebugState;
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
    debug: null
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
