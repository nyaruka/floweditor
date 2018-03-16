import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { FlowDefinition } from '../../flowTypes';

export default (state: FlowDefinition = initialState.definition, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_DEFINITION:
            return action.payload.definition;
        default:
            return state;
    }
};
