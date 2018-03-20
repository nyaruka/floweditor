import ActionTypes, {
    UpdateNodeToEditAction,
    UpdateActionToEditAction,
    UpdateTypeConfigAction,
    UpdateResultNameAction,
    UpdateOperandAction,
    UpdateUserAddingActionAction,
    UpdateShowResultNameAction
} from './actionTypes';
import Constants from './constants';
import { Type } from '../config';
import { AnyAction, Node } from '../flowTypes';

export interface NodeEditor {
    typeConfig: Type;
    resultName: string;
    showResultName: boolean;
    operand: string;
    userAddingAction: boolean;
    nodeToEdit: Node;
    actionToEdit: AnyAction;
}

// Initial state
export const initialState: NodeEditor = {
    typeConfig: null,
    resultName: '',
    showResultName: false,
    operand: '',
    userAddingAction: false,
    nodeToEdit: null,
    actionToEdit: null
};

// Action Creators
export const updateTypeConfig = (typeConfig: Type): UpdateTypeConfigAction => ({
    type: Constants.UPDATE_TYPE_CONFIG,
    payload: {
        typeConfig
    }
});

export const updateResultName = (resultName: string): UpdateResultNameAction => ({
    type: Constants.UPDATE_RESULT_NAME,
    payload: {
        resultName
    }
});

export const updateOperand = (operand: string): UpdateOperandAction => ({
    type: Constants.UPDATE_OPERAND,
    payload: {
        operand
    }
});

export const updateUserAddingAction = (
    userAddingAction: boolean
): UpdateUserAddingActionAction => ({
    type: Constants.UPDATE_USER_ADDING_ACTION,
    payload: {
        userAddingAction
    }
});

export const updateActionToEdit = (actionToEdit: AnyAction): UpdateActionToEditAction => ({
    type: Constants.UPDATE_ACTION_TO_EDIT,
    payload: {
        actionToEdit
    }
});

export const updateNodeToEdit = (nodeToEdit: Node): UpdateNodeToEditAction => ({
    type: Constants.UPDATE_NODE_TO_EDIT,
    payload: {
        nodeToEdit
    }
});

export const updateShowResultName = (showResultName: boolean): UpdateShowResultNameAction => ({
    type: Constants.UPDATE_SHOW_RESULT_NAME,
    payload: {
        showResultName
    }
});

// Reducers
export default (state: NodeEditor = initialState, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TYPE_CONFIG:
            return {
                ...state,
                typeConfig: action.payload.typeConfig
            };
        case Constants.UPDATE_RESULT_NAME:
            return {
                ...state,
                resultName: action.payload.resultName
            };
        case Constants.UPDATE_SHOW_RESULT_NAME:
            return {
                ...state,
                showResultName: action.payload.showResultName
            };
        case Constants.UPDATE_OPERAND:
            return {
                ...state,
                operand: action.payload.operand
            };
        case Constants.UPDATE_USER_ADDING_ACTION:
            return {
                ...state,
                userAddingAction: action.payload.userAddingAction
            };
        case Constants.UPDATE_NODE_TO_EDIT:
            return {
                ...state,
                nodeToEdit: action.payload.nodeToEdit
            };
        case Constants.UPDATE_ACTION_TO_EDIT:
            return {
                ...state,
                actionToEdit: action.payload.actionToEdit
            };
        default:
            return state;
    }
};
