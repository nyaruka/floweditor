import initialState, { ReduxState, SearchResult } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: SearchResult[] = initialState.groups, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_GROUPS:
            return action.payload.groups;
        default:
            return state;
    }
};
