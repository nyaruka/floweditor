import { EditorState, initialState as editorState } from '~/store/editor';
import { FlowContext, initialState as flowContext } from '~/store/flowContext';
import { initialState as nodeEditor, NodeEditor } from '~/store/nodeEditor';

interface AppState {
    flowContext: FlowContext;
    editorState: EditorState;
    nodeEditor: NodeEditor;
}

export const initialState: AppState = {
    flowContext,
    editorState,
    nodeEditor
};

export default AppState;
