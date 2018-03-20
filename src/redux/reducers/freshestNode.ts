import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { Node } from '../../flowTypes';

export default (state: Node = initialState.freshestNode, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_FRESHEST_NODE:
            return action.payload.freshestNode;
        default:
            return state;
    }
};
