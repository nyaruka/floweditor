// tslint:disable:no-shadowed-variable
import { combineReducers } from 'redux';

import { FlowDefinition, FlowNode, UINode } from '../flowTypes';
import { Asset } from '../services/AssetService';
import ActionTypes, {
    IncrementSuggestedResultNameCountAction,
    UpdateBaseLanguageAction,
    UpdateDefinitionAction,
    UpdateDependenciesAction,
    UpdateLanguagesAction,
    UpdateNodesAction,
    UpdateResultMapAction,
} from './actionTypes';
import Constants from './constants';

export interface RenderNodeMap {
    [uuid: string]: RenderNode;
}

export interface RenderNode {
    ui: UINode;
    node: FlowNode;
    inboundConnections: { [uuid: string]: string };
}

export interface CompletionOption {
    name: string;
    description: string;
}

export interface ResultMap {
    [nodeUUID: string]: string;
}

export interface Results {
    resultMap: ResultMap;
    suggestedNameCount: number;
}

export interface FlowContext {
    dependencies: FlowDefinition[];
    baseLanguage: Asset;
    languages: Asset[];
    results: Results;
    definition: FlowDefinition;
    nodes: { [uuid: string]: RenderNode };
}

// Initial state
export const initialState: FlowContext = {
    definition: null,
    dependencies: null,
    baseLanguage: null,
    languages: [],
    results: {
        resultMap: {},
        suggestedNameCount: 1
    },
    nodes: {}
};

// Action Creators
export const updateDefinition = (definition: FlowDefinition): UpdateDefinitionAction => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

export const updateNodes = (nodes: { [uuid: string]: RenderNode }): UpdateNodesAction => ({
    type: Constants.UPDATE_NODES,
    payload: {
        nodes
    }
});

export const updateDependencies = (dependencies: FlowDefinition[]): UpdateDependenciesAction => ({
    type: Constants.UPDATE_DEPENDENCIES,
    payload: {
        dependencies
    }
});

export const updateBaseLanguage = (baseLanguage: Asset): UpdateBaseLanguageAction => ({
    type: Constants.UPDATE_BASE_LANGUAGE,
    payload: {
        baseLanguage
    }
});

export const updateLanguages = (languages: Asset[]): UpdateLanguagesAction => ({
    type: Constants.UPDATE_LANGUAGES,
    payload: {
        languages
    }
});

export const updateResultMap = (resultMap: ResultMap): UpdateResultMapAction => ({
    type: Constants.UPDATE_RESULT_MAP,
    payload: {
        resultMap
    }
});

export const incrementSuggestedResultNameCount = (): IncrementSuggestedResultNameCountAction => ({
    type: Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT
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

export const resultMap = (
    state: ResultMap = initialState.results.resultMap,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_RESULT_MAP:
            return action.payload.resultMap;
        default:
            return state;
    }
};

export const suggestedNameCount = (
    state: number = initialState.results.suggestedNameCount,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT:
            return state + 1;
        default:
            return state;
    }
};

export const baseLanguage = (state: Asset = initialState.baseLanguage, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_BASE_LANGUAGE:
            return action.payload.baseLanguage;
        default:
            return state;
    }
};

export const languages = (state: Asset[] = initialState.languages, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_LANGUAGES:
            return action.payload.languages;
        default:
            return state;
    }
};

export const results = combineReducers({
    resultMap,
    suggestedNameCount
});

// Root reducer
export default combineReducers({
    definition,
    nodes,
    dependencies,
    results,
    baseLanguage,
    languages
});
