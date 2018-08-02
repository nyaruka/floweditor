import { combineReducers } from 'redux';

import flowContext from '~/store/flowContext';
import flowEditor from '~/store/flowEditor';
import nodeEditor from '~/store/nodeEditor';

export default combineReducers({
    flowContext,
    flowEditor,
    nodeEditor
});
