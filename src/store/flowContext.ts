import { FlowDefinition, FlowNode, UINode } from 'flowTypes';
import { combineReducers } from 'redux';
import ActionTypes, {
  UpdateAssetsAction,
  UpdateBaseLanguageAction,
  UpdateContactFieldsAction,
  UpdateDefinitionAction,
  UpdateDependenciesAction,
  UpdateNodesAction
} from 'store/actionTypes';
import Constants from 'store/constants';

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

export interface FunctionExample {
  template: string;
  output: string;
}

export interface CompletionOption {
  name?: string;
  summary: string;

  // functions
  signature?: string;
  detail?: string;
  examples?: FunctionExample[];
}

export interface ContactFields {
  [snakedFieldName: string]: string;
}

export enum AssetType {
  Channel = 'channel',
  Classifier = 'classifier',
  Contact = 'contact',
  ContactProperty = 'property',
  Currency = 'currency',
  Environment = 'environment',
  Expression = 'expression',
  Field = 'field',
  Flow = 'flow',
  Global = 'global',
  Group = 'group',
  Label = 'label',
  Language = 'language',
  Remove = 'remove',
  Resthook = 'resthook',
  Result = 'result',
  Revision = 'revision',
  Scheme = 'scheme',
  Template = 'template',
  URN = 'urn'
}

export interface Reference {
  nodeUUID: string;
  actionUUID?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;

  order?: number;
  references?: Reference[];
  isNew?: boolean;
  content?: any;
}

export const REMOVE_VALUE_ASSET = {
  id: AssetType.Remove,
  name: 'Remove Value',
  type: AssetType.Remove
};

export const DEFAULT_LANGUAGE = {
  id: 'base',
  name: 'Default',
  type: AssetType.Language
};

export interface AssetStore {
  [assetType: string]: Assets;
}

export interface AssetMap {
  [id: string]: Asset;
}

export interface Assets {
  // our local cache of assets
  items: AssetMap;

  type: AssetType;

  // an optional endpoint to search for more
  endpoint?: string;

  // option name for the id when fetching remotely
  id?: string;

  // have our assets already been loaded
  prefetched?: boolean;
}

export interface FlowContext {
  dependencies: FlowDefinition[];
  baseLanguage: Asset;
  contactFields: ContactFields;
  definition: FlowDefinition;
  nodes: { [uuid: string]: RenderNode };
  assetStore: AssetStore;
}

// Initial state
export const initialState: FlowContext = {
  definition: null,
  dependencies: null,
  baseLanguage: null,
  contactFields: {},
  nodes: {},
  assetStore: {}
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

export const updateAssets = (assets: AssetStore): UpdateAssetsAction => ({
  type: Constants.UPDATE_ASSET_MAP,
  payload: {
    assets
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

export const assetStore = (state: AssetStore = initialState.assetStore, action: ActionTypes) => {
  switch (action.type) {
    case Constants.UPDATE_ASSET_MAP:
      return action.payload.assets;
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

// Root reducer
export default combineReducers({
  definition,
  nodes,
  dependencies,
  assetStore,
  baseLanguage,
  contactFields
});
