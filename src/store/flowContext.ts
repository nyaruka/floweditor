import { FlowDefinition, UINode, Node } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import ActionTypes, {
    UpdateResultNamesAction,
    UpdateGroupsAction,
    UpdateContactFieldsAction,
    UpdateLocalizationsAction,
    UpdateDependenciesAction,
    UpdateDefinitionAction,
    UpdateNodesAction
} from './actionTypes';
import Constants from './constants';
import { combineReducers } from 'redux';

export interface RenderNode {
    ui: UINode;
    node: Node;
    inboundConnections?: { [uuid: string]: string };
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
    dependencies: FlowDefinition[];
    localizations: LocalizedObject[];
    contactFields: ContactFieldResult[];
    resultNames: CompletionOption[];
    groups: SearchResult[];

    // the initial definition
    definition: FlowDefinition;

    // our map of nodes
    nodes: { [uuid: string]: RenderNode };
}

// Initial state
export const initialState: FlowContext = {
    definition: null,
    dependencies: null,
    localizations: [],
    contactFields: [],
    resultNames: [],
    groups: [],
    nodes: {}
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
export const updateNodes = (nodes: { [uuid: string]: RenderNode }): UpdateNodesAction => ({
    type: Constants.UPDATE_NODES,
    payload: {
        nodes
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

export const nodes = (state: {} = initialState.nodes, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_NODES:
            return action.payload.nodes;
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

// Root reducer
export default combineReducers({
    definition,
    nodes,
    dependencies,
    localizations,
    contactFields,
    resultNames,
    groups
});
