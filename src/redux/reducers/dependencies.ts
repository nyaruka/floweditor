import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { FlowDefinition } from '../../flowTypes';

export default (state: FlowDefinition[] = initialState.dependencies, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_DEPENDENCIES:
            return action.payload.dependencies;
        default:
            return state;
    }
};
