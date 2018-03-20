import initialState, { ReduxState, ContactFieldResult } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: ContactFieldResult[] = initialState.contactFields, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_CONTACT_FIELDS:
            return action.payload.contactFields;
        default:
            return state;
    }
};
