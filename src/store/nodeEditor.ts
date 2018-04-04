import { combineReducers } from 'redux';
import { Type } from '../config';
import { AnyAction, FlowNode } from '../flowTypes';
import ActionTypes, {
    UpdateActionToEditAction,
    UpdateNodeToEditAction,
    UpdateOperandAction,
    UpdateResultNameAction,
    UpdateShowResultNameAction,
    UpdateTypeConfigAction,
    UpdateUserAddingActionAction
} from './actionTypes';
import Constants from './constants';

export interface NodeEditor {
    typeConfig: Type;
    resultName: string;
    showResultName: boolean;
    operand: string;
    userAddingAction: boolean;
    nodeToEdit: FlowNode;
    actionToEdit: AnyAction;
}

const DEFAULT_OPERAND = '@input';

// Initial state
export const initialState: NodeEditor = {
    typeConfig: null,
    resultName: '',
    showResultName: false,
    operand: DEFAULT_OPERAND,
    userAddingAction: false,
    nodeToEdit: null,
    actionToEdit: null
};

// Action Creators
// tslint:disable-next-line:no-shadowed-variable
export const updateTypeConfig = (typeConfig: Type): UpdateTypeConfigAction => ({
    type: Constants.UPDATE_TYPE_CONFIG,
    payload: {
        typeConfig
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateResultName = (resultName: string): UpdateResultNameAction => ({
    type: Constants.UPDATE_RESULT_NAME,
    payload: {
        resultName
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateOperand = (operand: string): UpdateOperandAction => ({
    type: Constants.UPDATE_OPERAND,
    payload: {
        operand
    }
});

export const updateUserAddingAction = (
    // tslint:disable-next-line:no-shadowed-variable
    userAddingAction: boolean
): UpdateUserAddingActionAction => ({
    type: Constants.UPDATE_USER_ADDING_ACTION,
    payload: {
        userAddingAction
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateActionToEdit = (actionToEdit: AnyAction): UpdateActionToEditAction => ({
    type: Constants.UPDATE_ACTION_TO_EDIT,
    payload: {
        actionToEdit
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateNodeToEdit = (nodeToEdit: FlowNode): UpdateNodeToEditAction => ({
    type: Constants.UPDATE_NODE_TO_EDIT,
    payload: {
        nodeToEdit
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateShowResultName = (showResultName: boolean): UpdateShowResultNameAction => ({
    type: Constants.UPDATE_SHOW_RESULT_NAME,
    payload: {
        showResultName
    }
});

// Reducers
export const typeConfig = (state: Type = initialState.typeConfig, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TYPE_CONFIG:
            return action.payload.typeConfig;
        default:
            return state;
    }
};

export const resultName = (state: string = initialState.resultName, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_RESULT_NAME:
            return action.payload.resultName;
        default:
            return state;
    }
};

export const showResultName = (
    state: boolean = initialState.showResultName,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_SHOW_RESULT_NAME:
            return action.payload.showResultName;
        default:
            return state;
    }
};

export const operand = (state: string = initialState.operand, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_OPERAND:
            return action.payload.operand;
        default:
            return state;
    }
};

export const userAddingAction = (
    state: boolean = initialState.userAddingAction,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_USER_ADDING_ACTION:
            return action.payload.userAddingAction;
        default:
            return state;
    }
};

export const nodeToEdit = (state: FlowNode = initialState.nodeToEdit, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_TO_EDIT:
            return action.payload.nodeToEdit;
        default:
            return state;
    }
};

export const actionToEdit = (state: AnyAction = initialState.actionToEdit, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_ACTION_TO_EDIT:
            return action.payload.actionToEdit;
        default:
            return state;
    }
};

// Root reducer
export default combineReducers({
    typeConfig,
    resultName,
    showResultName,
    operand,
    userAddingAction,
    nodeToEdit,
    actionToEdit
});
