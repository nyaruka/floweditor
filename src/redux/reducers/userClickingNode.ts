import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.userClickingNode, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_USER_CLICKING_NODE:
            return action.payload.userClickingNode;
        default:
            return state;
    }
};
