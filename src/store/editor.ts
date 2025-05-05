import { FlowPosition, Contact } from 'flowTypes';
import ActionTypes, { UpdateEditorState } from 'store/actionTypes';
import Constants from 'store/constants';
import { RenderNode } from 'store/flowContext';

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
  recentContacts?: { [key: string]: RecentContact[] };
  is_starting?: boolean;
}

export interface RecentContact {
  contact: Contact;
  operand: string;
  time: string;
}

export interface Warning {
  name: string;
  type: string;
}

export type Warnings = { [uuid: string]: Warning };

export interface EditorState {
  currentRevision: number | null;
  simulating: boolean;
  fetchingFlow: boolean;
  ghostNode: RenderNode | null;
  dragActive: boolean;
  dragStartTime: number;
  dragDownPosition: FlowPosition | null;
  dragNodeUUID: string | null;
  dragGroup: boolean;
  dragSelection: DragSelection | null;
  debug?: DebugState | null;

  // which poptab is popped
  popped: string;

  warnings: Warnings;

  modalMessage?: ModalMessage;
  saving?: boolean;

  // the currently shown activity, can be
  // simulation or live
  activity: Activity;

  // the current live activity
  liveActivity: Activity;

  // interval in millis we should refresh activity
  activityInterval: number;

  // is our page visible or tabbed away
  visible: boolean;

  scrollToNode: string;
  scrollToAction: string;
}

export interface ModalMessage {
  title: string;
  body: string;
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
  currentRevision: null,
  simulating: false,
  fetchingFlow: false,
  dragStartTime: 0,
  dragDownPosition: null,
  dragActive: false,
  dragNodeUUID: null,
  dragGroup: false,
  dragSelection: null,
  ghostNode: null,
  debug: null,
  warnings: {},

  popped: null,

  activity: { segments: {}, nodes: {} },
  liveActivity: { segments: {}, nodes: {} },
  activityInterval: 5000,
  visible: true,

  scrollToNode: null,
  scrollToAction: null
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
      return action.payload!.editorState;
    default:
      return editorState;
  }
};

// export our reducer
export default editorState;
