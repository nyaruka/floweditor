import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.nodeEditorOpen, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_EDITOR_OPEN:
            return action.payload.nodeEditorOpen;
        default:
            return state;
    }
};
