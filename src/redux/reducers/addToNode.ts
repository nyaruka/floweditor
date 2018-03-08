import { Node } from '../../flowTypes';
import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: Node = initialState.addToNode, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_ADD_TO_NODE:
            return action.payload.addToNode;
        default:
            return state;
    }
};
