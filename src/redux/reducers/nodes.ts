import initialState, { ReduxState } from '../initialState';
import { Node } from '../../flowTypes';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: Node[] = initialState.nodes, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_NODES:
            return action.payload.nodes;
        default:
            return state;
    }
};
