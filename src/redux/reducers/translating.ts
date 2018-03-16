import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.translating, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TRANSLATING:
            return action.payload.translating;
        default:
            return state;
    }
};
