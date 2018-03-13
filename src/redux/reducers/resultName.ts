import ActionTypes from '../actionTypes';
import Constants from '../constants';
import initialState from '../initialState';

export default (state: string = initialState.resultName, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_RESULT_NAME:
            return action.payload.resultName;
        default:
            return state;
    }
};
