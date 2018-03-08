import initialState, { ReduxState, CompletionOption } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { LocalizedObject } from '../../services/Localization';

export default (state: LocalizedObject[] = initialState.localizations, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_LOCALIZATIONS:
            return action.payload.localizations;
        default:
            return state;
    }
};
