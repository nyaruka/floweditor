import ActionTypes from '../actionTypes';
import Constants from '../constants';
import initialState from '../initialState';

export default (state: string = initialState.operand, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_OPERAND:
            return action.payload.operand;
        default:
            return state;
    }
};
