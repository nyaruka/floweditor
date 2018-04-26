import { Option } from 'react-select';
import { combineReducers } from 'redux';
import { FlowDefinition, FlowNode, UINode } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import ActionTypes, {
    UpdateDefinitionAction,
    UpdateDependenciesAction,
    UpdateLocalizationsAction,
    UpdateNodesAction,
    UpdateResultNamesAction
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

export interface FlowContext {
    dependencies: FlowDefinition[];
    localizations: LocalizedObject[];
    resultNames: CompletionOption[];
    definition: FlowDefinition;
    nodes: { [uuid: string]: RenderNode };
}

// Initial state
export const initialState: FlowContext = {
    definition: null,
    dependencies: null,
    localizations: [],
    resultNames: [],
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

// Root reducer
export default combineReducers({
    definition,
    nodes,
    dependencies,
    localizations,
    resultNames
});
