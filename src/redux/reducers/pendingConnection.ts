import initialState, { ReduxState, CompletionOption } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { DragPoint } from '../../component/Node';

export default (state: DragPoint = initialState.pendingConnection, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_PENDING_CONNECTION:
            return action.payload.pendingConnection;
        default:
            return state;
    }
};
