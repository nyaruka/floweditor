import initialState, { ReduxState, CompletionOption } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: CompletionOption[] = initialState.resultNames, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_RESULT_NAMES:
            return action.payload.resultNames;
        default:
            return state;
    }
};
