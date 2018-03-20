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
export const updateDefinition = (definition: FlowDefinition): UpdateDefinitionAction => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

export const updateDependencies = (dependencies: FlowDefinition[]): UpdateDependenciesAction => ({
    type: Constants.UPDATE_DEPENDENCIES,
    payload: {
        dependencies
    }
});

export const updateLocalizations = (
    localizations: LocalizedObject[]
): UpdateLocalizationsAction => ({
    type: Constants.UPDATE_LOCALIZATIONS,
    payload: {
        localizations
    }
});

export const updateContactFields = (
    contactFields: ContactFieldResult[]
): UpdateContactFieldsAction => ({
    type: Constants.UPDATE_CONTACT_FIELDS,
    payload: {
        contactFields
    }
});

export const updateGroups = (groups: SearchResult[]): UpdateGroupsAction => ({
    type: Constants.UPDATE_GROUPS,
    payload: {
        groups
    }
});

export const updateResultNames = (resultNames: CompletionOption[]): UpdateResultNamesAction => ({
    type: Constants.UPDATE_RESULT_NAMES,
    payload: {
        resultNames
    }
});

export const updateComponents = (components: Components): UpdateComponentsAction => ({
    type: Constants.UPDATE_COMPONENTS,
    payload: {
        components
    }
});

// Reducer
export default (state: FlowContext = initialState, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_DEFINITION:
            return {
                ...state,
                definition: action.payload.definition
            };
        case Constants.UPDATE_DEPENDENCIES:
            return {
                ...state,
                dependencies: action.payload.dependencies
            };
        case Constants.UPDATE_LOCALIZATIONS:
            return {
                ...state,
                localizations: action.payload.localizations
            };
        case Constants.UPDATE_CONTACT_FIELDS:
            return {
                ...state,
                contactFields: action.payload.contactFields
            };
        case Constants.UPDATE_RESULT_NAMES:
            return {
                ...state,
                resultNames: action.payload.resultNames
            };
        case Constants.UPDATE_GROUPS:
            return {
                ...state,
                groups: action.payload.groups
            };
        case Constants.UPDATE_COMPONENTS:
            return {
                ...state,
                components: action.payload.components
            };
        default:
            return state;
    }
};
