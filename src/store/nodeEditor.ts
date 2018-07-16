// tslint:disable:no-shadowed-variable
import { combineReducers } from 'redux';
import { Type } from '~/config';
import { Types } from '~/config/typeConfigs';
import { AnyAction, FlowNode } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { LocalizedObject } from '~/services/Localization';
import ActionTypes, {
    UpdateFormAction,
    UpdateNodeEditorSettings,
    UpdateOperandAction,
    UpdateResultNameAction,
    UpdateShowResultNameAction,
    UpdateTimeoutAction,
    UpdateTypeConfigAction,
    UpdateUserAddingActionAction
} from '~/store/actionTypes';
import Constants from '~/store/constants';

export interface ValidationFailure {
    message: string;
}

export interface FormEntry {
    value: any;
    validationFailures?: ValidationFailure[];
}

export interface StringEntry extends FormEntry {
    value: string;
}

export interface StringArrayEntry extends FormEntry {
    value: string[];
}

export interface AssetEntry extends FormEntry {
    value: Asset;
}

export interface AssetArrayEntry extends FormEntry {
    value: Asset[];
}

export interface FormState {
    type: Types;
    validationFailures?: ValidationFailure[];
    valid: boolean;
}

export interface SendBroadcastFormState extends FormState {
    text: StringEntry;
    recipients: AssetArrayEntry;
}

export interface SendMsgFormState extends FormState {
    text: StringEntry;
    quickReplies: StringArrayEntry;
    sendAll: boolean;
}

export interface SwitchRouterFormState extends FormState {}

export interface AddLabelsFormState extends FormState {
    labels: AssetArrayEntry;
}

export interface SendEmailFormState extends FormState {
    recipients: StringArrayEntry;
    subject: StringEntry;
    body: StringEntry;
}

export interface SetContactFieldFormState extends FormState {
    field: AssetEntry;
    value: StringEntry;
}

export interface SetContactNameFormState extends FormState {
    name: AssetEntry;
    value: StringEntry;
}

export interface SetContactLanguageFormState extends FormState {
    language: AssetEntry;
    value: AssetEntry;
}

export interface SetContactChannelFormState extends FormState {
    channel: AssetEntry;
    value: AssetEntry;
}

export interface SetRunResultFormState extends FormState {
    name: StringEntry;
    value: StringEntry;
    category: StringEntry;
}

export interface ChangeGroupsFormState extends FormState {
    groups: AssetArrayEntry;
    removeAll?: boolean;
}

export type SetContactAttribFormState =
    | SetContactFieldFormState
    | SetContactNameFormState
    | SetContactLanguageFormState
    | SetContactChannelFormState;

export interface StartSessionFormState extends FormState {
    recipients: AssetArrayEntry;
    flow: AssetEntry;
}

export type NodeEditorForm =
    | SetRunResultFormState
    | SendBroadcastFormState
    | StartSessionFormState
    | SendMsgFormState
    | SetContactAttribFormState
    | AddLabelsFormState
    | ChangeGroupsFormState
    | SendEmailFormState
    | SwitchRouterFormState;

export interface NodeEditorSettings {
    originalNode: FlowNode;
    showAdvanced?: boolean;
    originalAction?: AnyAction;
    localizations?: LocalizedObject[];
    languages?: Asset[];
}

export interface NodeEditor {
    typeConfig: Type;
    resultName: string;
    showResultName: boolean;
    operand: string;
    userAddingAction: boolean;
    settings: NodeEditorSettings;
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
    form: null,
    timeout: null,
    settings: null
};

// Action Creators
export const updateTypeConfig = (typeConfig: Type): UpdateTypeConfigAction => ({
    type: Constants.UPDATE_TYPE_CONFIG,
    payload: {
        typeConfig
    }
});

export const updateForm = (form: NodeEditorForm): UpdateFormAction => ({
    type: Constants.UPDATE_FORM,
    payload: {
        form
    }
});

export const updateNodeEditorSettings = (
    settings: NodeEditorSettings
): UpdateNodeEditorSettings => ({
    type: Constants.UPDATE_NODE_EDITOR_SETTINGS,
    payload: {
        settings
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

export const timeout = (state: number = initialState.timeout, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_TIMEOUT:
            return action.payload.timeout;
        default:
            return state;
    }
};

export const settings = (
    state: NodeEditorSettings = initialState.settings,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_NODE_EDITOR_SETTINGS:
            return action.payload.settings;
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
    settings,
    form,
    timeout
});
