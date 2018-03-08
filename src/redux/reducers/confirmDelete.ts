import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.confirmDelete, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_CONFIRM_DELETE:
            return action.payload.confirmDelete;
        default:
            return state;
    }
};
