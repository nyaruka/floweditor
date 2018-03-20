import initialState, { ReduxState } from '../initialState';
import ActionTypes from '../actionTypes';
import Constants from '../constants';
import { PendingConnections } from '../initialState';

export default (
    state: PendingConnections = initialState.pendingConnections,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_PENDING_CONNECTIONS:
            return {
                ...state.pendingConnections,
                [action.payload.draggedTo]: action.payload.draggedFrom
            };
        case Constants.REMOVE_PENDING_CONNECTION:
            const newPendingConnections = { ...state.pendingConnections };
            delete newPendingConnections[action.payload.nodeUUID];
            return newPendingConnections;
        default:
            return state;
    }
};
