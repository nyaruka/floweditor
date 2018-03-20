import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.nodeDragging, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_DRAGGING:
            return action.payload.nodeDragging;
        default:
            return state;
    }
};
