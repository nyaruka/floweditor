import { FlowContext, initialState as flowContext } from '~/store/flowContext';
import { FlowEditor, initialState as flowEditor } from '~/store/flowEditor';
import { initialState as nodeEditor, NodeEditor } from '~/store/nodeEditor';

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
