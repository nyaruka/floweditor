import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.userAddingAction, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_USER_ADDING_ACTION:
            console.log('payload:', action.payload);
            return action.payload.userAddingAction;
        default:
            return state;
    }
};
