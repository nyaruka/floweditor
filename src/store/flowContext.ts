import { FlowDefinition } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import ActionTypes, {
    UpdateComponentsAction,
    UpdateResultNamesAction,
    UpdateGroupsAction,
    UpdateContactFieldsAction,
    UpdateLocalizationsAction,
    UpdateDependenciesAction,
    UpdateDefinitionAction
} from './actionTypes';
import Constants from './constants';
import { combineReducers } from 'redux';

export interface ComponentDetails {
    nodeUUID: string;
    nodeIdx: number;
    actionIdx?: number;
    actionUUID?: string;
    exitIdx?: number;
    exitUUID?: string;
    pointers?: string[];
    type?: string;
    isRouter?: boolean;
}

export interface Components {
    [uuid: string]: ComponentDetails;
}

export interface SearchResult {
    name: string;
    id: string;
    type?: string;
    prefix?: string;
    extraResult?: boolean;
}

export interface ContactFieldResult extends SearchResult {
    key?: string;
}

export interface CompletionOption {
    name: string;
    description: string;
}

export interface FlowContext {
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    localizations: LocalizedObject[];
    contactFields: ContactFieldResult[];
    resultNames: CompletionOption[];
    groups: SearchResult[];
    components: Components;
}

// Initial state
export const initialState: FlowContext = {
    definition: null,
    dependencies: null,
    localizations: [],
    contactFields: [],
    resultNames: [],
    groups: [],
    components: {}
};

// Action Creators
// tslint:disable-next-line:no-shadowed-variable
export const updateDefinition = (definition: FlowDefinition): UpdateDefinitionAction => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateDependencies = (dependencies: FlowDefinition[]): UpdateDependenciesAction => ({
    type: Constants.UPDATE_DEPENDENCIES,
    payload: {
        dependencies
    }
});

export const updateLocalizations = (
    // tslint:disable-next-line:no-shadowed-variable
    localizations: LocalizedObject[]
): UpdateLocalizationsAction => ({
    type: Constants.UPDATE_LOCALIZATIONS,
    payload: {
        localizations
    }
});

export const updateContactFields = (
    // tslint:disable-next-line:no-shadowed-variable
    contactFields: ContactFieldResult[]
): UpdateContactFieldsAction => ({
    type: Constants.UPDATE_CONTACT_FIELDS,
    payload: {
        contactFields
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateGroups = (groups: SearchResult[]): UpdateGroupsAction => ({
    type: Constants.UPDATE_GROUPS,
    payload: {
        groups
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateResultNames = (resultNames: CompletionOption[]): UpdateResultNamesAction => ({
    type: Constants.UPDATE_RESULT_NAMES,
    payload: {
        resultNames
    }
});

// tslint:disable-next-line:no-shadowed-variable
export const updateComponents = (components: Components): UpdateComponentsAction => ({
    type: Constants.UPDATE_COMPONENTS,
    payload: {
        components
    }
});

// Reducers
export const definition = (
    state: FlowDefinition = initialState.definition,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_DEFINITION:
            return action.payload.definition;
        default:
            return state;
    }
};

export const dependencies = (
    state: FlowDefinition[] = initialState.dependencies,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_DEPENDENCIES:
            return action.payload.dependencies;
        default:
            return state;
    }
};

export const localizations = (
    state: LocalizedObject[] = initialState.localizations,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_LOCALIZATIONS:
            return action.payload.localizations;
        default:
            return state;
    }
};

export const contactFields = (
    state: ContactFieldResult[] = initialState.contactFields,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_CONTACT_FIELDS:
            return action.payload.contactFields;
        default:
            return state;
    }
};

export const resultNames = (
    state: CompletionOption[] = initialState.resultNames,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_RESULT_NAMES:
            return action.payload.resultNames;
        default:
            return state;
    }
};

export const groups = (state: SearchResult[] = initialState.groups, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_GROUPS:
            return action.payload.groups;
        default:
            return state;
    }
};

export const components = (state: Components = initialState.components, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_COMPONENTS:
            return action.payload.components;
        default:
            return state;
    }
};

// Root reducer
export default combineReducers({
    definition,
    dependencies,
    localizations,
    contactFields,
    resultNames,
    groups,
    components
});
