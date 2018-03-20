import { Type } from '../../config';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import initialState from '../initialState';

export default (state: Type = initialState.typeConfig, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TYPE_CONFIG:
            return action.payload.typeConfig;
        default:
            return state;
    }
};
