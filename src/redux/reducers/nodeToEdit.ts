import { Node } from '../../flowTypes';
import initialState, { ReduxState, CompletionOption } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: Node = initialState.nodeToEdit, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_TO_EDIT:
            return action.payload.nodeToEdit;
        default:
            return state;
    }
};
