import initialState, { ReduxState, Flows } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: Flows = initialState.flows, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_FLOWS:
            return action.payload.flows;
        default:
            return state;
    }
};
