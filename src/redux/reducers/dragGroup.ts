import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: boolean = initialState.dragGroup, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_DRAG_GROUP:
            return action.payload.dragGroup;
        default:
            return state;
    }
};
