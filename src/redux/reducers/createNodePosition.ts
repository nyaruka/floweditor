import { Position } from '../../flowTypes';
import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';

export default (state: Position = initialState.createNodePosition, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_CREATE_NODE_POSITION:
            return action.payload.createNodePosition;
        default:
            return state;
    }
};
