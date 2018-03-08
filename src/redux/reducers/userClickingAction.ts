import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.userClickingAction, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_USER_CLICKING_ACTION:
            return action.payload.userClickingAction;
        default:
            return state;
    }
};
