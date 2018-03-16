import { Node } from '../../flowTypes';
import initialState, { ReduxState, CompletionOption } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: Node = initialState.ghostNode, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_GHOST_NODE:
            return action.payload.ghostNode;
        default:
            return state;
    }
};
