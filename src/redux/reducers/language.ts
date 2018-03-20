import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { Language } from '../../component/LanguageSelector';

export default (state: Language = initialState.language, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_LANGUAGE:
            return action.payload.language;
        default:
            return state;
    }
};
