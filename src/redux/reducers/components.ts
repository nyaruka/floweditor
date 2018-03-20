import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { Components } from '../initialState';

export default (state: Components = initialState.components, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_COMPONENTS:
            return action.payload.components;
        default:
            return state;
    }
};
