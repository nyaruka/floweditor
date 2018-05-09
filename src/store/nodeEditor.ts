// tslint:disable:no-shadowed-variable
import { combineReducers } from 'redux';

import { Type } from '../config';
import { Types } from '../config/typeConfigs';
import { AnyAction, FlowNode } from '../flowTypes';
import { Asset } from '../services/AssetService';
import ActionTypes, {
    UpdateActionToEditAction,
    UpdateForm,
    UpdateNodeToEditAction,
    UpdateOperandAction,
    UpdateResultNameAction,
    UpdateShowResultNameAction,
    UpdateTimeoutAction,
    UpdateTypeConfigAction,
    UpdateUserAddingActionAction
} from './actionTypes';
import Constants from './constants';

export interface ActionState {
    type: Types;
    uuid: string;
}
export interface SendBroadcastFormState extends ActionState {
    text: string;
    recipients: Asset[];
    translatedText: string;
}
export type NodeEditorForm = SendBroadcastFormState;

export interface NodeEditor {
    typeConfig: Type;
    resultName: string;
    showResultName: boolean;
    operand: string;
    userAddingAction: boolean;
    nodeToEdit: FlowNode;
    actionToEdit: AnyAction;
    form: NodeEditorForm;
    timeout: number;
}

const DEFAULT_OPERAND = '@run.input';

// Initial state
export const initialState: NodeEditor = {
    typeConfig: null,
    resultName: '',
    showResultName: false,
    operand: DEFAULT_OPERAND,
    userAddingAction: false,
    nodeToEdit: null,
    actionToEdit: null,
    form: null,
    timeout: null
};

// Action Creators
export const updateTypeConfig = (typeConfig: Type): UpdateTypeConfigAction => ({
    type: Constants.UPDATE_TYPE_CONFIG,
    payload: {
        typeConfig
    }
});

export const updateForm = (form: NodeEditorForm): UpdateForm => ({
    type: Constants.UPDATE_FORM,
    payload: {
        form
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

export const updateNodeToEdit = (nodeToEdit: FlowNode): UpdateNodeToEditAction => ({
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

// tslint:disable-next-line:no-shadowed-variable
export const updateTimeout = (timeout: number): UpdateTimeoutAction => ({
    type: Constants.UPDATE_TIMEOUT,
    payload: {
        timeout
    }
});

// Reducers
export const form = (state: NodeEditorForm = initialState.form, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_FORM:
            return action.payload.form;
        default:
            return state;
    }
};

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

export const timeout = (state: number = initialState.timeout, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TIMEOUT:
            return action.payload.timeout;
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
    actionToEdit,
    form,
    timeout
});
