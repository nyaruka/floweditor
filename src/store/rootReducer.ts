import { combineReducers } from 'redux';
import flowContext from './flowContext';
import flowEditor from './flowEditor';
import nodeEditor from './nodeEditor';

export default combineReducers({
    flowContext,
    flowEditor,
    nodeEditor
});
