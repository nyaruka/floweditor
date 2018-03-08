import { AnyAction } from '../../flowTypes';
import initialState, { ReduxState, CompletionOption } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: AnyAction = initialState.actionToEdit, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_ACTION_TO_EDIT:
            return action.payload.actionToEdit;
        default:
            return state;
    }
};
