import { combineReducers } from "redux";
import editorState from "store/editor";
import flowContext from "store/flowContext";
import nodeEditor from "store/nodeEditor";

export default combineReducers({
  flowContext,
  editorState,
  nodeEditor
});
