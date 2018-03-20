import { FlowContext, initialState as flowContext } from './flowContext';
import { FlowEditor, initialState as flowEditor } from './flowEditor';
import { NodeEditor, initialState as nodeEditor } from './nodeEditor';

interface AppState {
    flowContext: FlowContext;
    flowEditor: FlowEditor;
    nodeEditor: NodeEditor;
}

export const initialState: AppState = {
    flowContext,
    flowEditor,
    nodeEditor
};

export default AppState;
