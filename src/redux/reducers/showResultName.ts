import ActionTypes from '../actionTypes';
import Constants from '../constants';
import initialState from '../initialState';

export default (state: boolean = initialState.showResultName, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_SHOW_RESULT_NAME:
            return action.payload.showResultName;
        default:
            return state;
    }
};
