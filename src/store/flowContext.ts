import { combineReducers } from 'redux';
import { FlowDefinition, FlowNode, UINode } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import ActionTypes, {
    IncrementSuggestedResultNameCountAction,
    UpdateAssetsAction,
    UpdateBaseLanguageAction,
    UpdateContactFieldsAction,
    UpdateDefinitionAction,
    UpdateDependenciesAction,
    UpdateNodesAction,
    UpdateResultMapAction
} from '~/store/actionTypes';
import Constants from '~/store/constants';

// tslint:disable:no-shadowed-variable
export interface RenderNodeMap {
    [uuid: string]: RenderNode;
}

export interface RenderNode {
    ui: UINode;
    node: FlowNode;
    inboundConnections: { [nodeUUID: string]: string };
    ghost?: boolean;
}

export interface CompletionOption {
    name: string;
    description: string;
}
export interface ResultMap {
    [nodeOrActionUUID: string]: string;
}

export interface Results {
    resultMap: ResultMap;
    suggestedNameCount: number;
}

export interface ContactFields {
    [snakedFieldName: string]: string;
}

export interface AssetStore {
    [assetType: string]: Assets;
}

export interface AssetMap {
    [id: string]: Asset;
}

export interface Assets {
    // our local cache of assets
    items: AssetMap;

    // an optional endpoint to search for more
    endpoint?: string;
}

export interface FlowContext {
    dependencies: FlowDefinition[];
    baseLanguage: Asset;
    languages: Asset[];
    results: Results;
    contactFields: ContactFields;
    definition: FlowDefinition;
    nodes: { [uuid: string]: RenderNode };
    assets: AssetStore;
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
    contactFields: {},
    nodes: {},
    assets: {}
};

// Action Creators
export const updateDefinition = (definition: FlowDefinition): UpdateDefinitionAction => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

export const updateNodes = (nodes: RenderNodeMap): UpdateNodesAction => ({
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

export const updateContactFields = (contactFields: ContactFields): UpdateContactFieldsAction => ({
    type: Constants.UPDATE_CONTACT_FIELDS,
    payload: {
        contactFields
    }
});

export const updateResultMap = (resultMap: ResultMap): UpdateResultMapAction => ({
    type: Constants.UPDATE_RESULT_MAP,
    payload: {
        resultMap
    }
});

export const updateAssets = (assets: AssetStore): UpdateAssetsAction => ({
    type: Constants.UPDATE_ASSET_MAP,
    payload: {
        assets
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

export const assets = (state: AssetStore = initialState.assets, action: ActionTypes) => {
    switch (action.type) {
        case Constants.UPDATE_ASSET_MAP:
            return action.payload.assets;
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

export const contactFields = (
    state: ContactFields = initialState.contactFields,
    action: ActionTypes
) => {
    switch (action.type) {
        case Constants.UPDATE_CONTACT_FIELDS:
            return action.payload.contactFields;
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
    assets,
    results,
    baseLanguage,
    languages,
    contactFields
});
