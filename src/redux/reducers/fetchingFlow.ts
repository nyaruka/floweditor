import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.fetchingFlow, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_FETCHING_FLOW:
            return action.payload.fetchingFlow;
        default:
            return state;
    }
};
