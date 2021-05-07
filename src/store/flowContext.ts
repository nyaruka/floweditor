import { FlowDefinition, FlowNode, UINode, FlowMetadata, FlowIssue } from 'flowTypes';
import { combineReducers, Action } from 'redux';
import ActionTypes, {
  UpdateAssetsAction,
  UpdateBaseLanguageAction,
  UpdateContactFieldsAction,
  UpdateDefinitionAction,
  UpdateNodesAction,
  UpdateMetadataAction,
  UpdateIssuesAction
} from 'store/actionTypes';
import Constants from 'store/constants';
import { Type } from 'config/interfaces';
import { TembaStore } from 'temba-components';
import i18n from 'config/i18n';

// tslint:disable:no-shadowed-variable
export interface RenderNodeMap {
  [uuid: string]: RenderNode;
}

export interface FlowIssueMap {
  [uuid: string]: FlowIssue[];
}

export interface RenderNode {
  ui: UINode;
  node: FlowNode;
  inboundConnections: { [nodeUUID: string]: string };
  ghost?: boolean;
}

export interface RenderAction {
  action: Action;
  config: Type;
  index?: number;
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
  NameMatch = 'name_match',
  Remove = 'remove',
  Resthook = 'resthook',
  Result = 'result',
  Revision = 'revision',
  Scheme = 'scheme',
  Template = 'template',
  Ticketer = 'ticketer',
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
  name: i18n.t('forms.remove_value', 'Remove Value'),
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
  metadata: FlowMetadata;
  baseLanguage: Asset;
  contactFields: ContactFields;
  definition: FlowDefinition;
  nodes: { [uuid: string]: RenderNode };
  issues: FlowIssueMap;
  assetStore: AssetStore;
}

// Initial state
export const initialState: FlowContext = {
  definition: null,
  baseLanguage: null,
  metadata: {
    dependencies: [],
    results: [],
    waiting_exit_uuids: [],
    parent_refs: []
  },
  contactFields: {},
  nodes: {},
  issues: {},
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

export const updateIssues = (issues: FlowIssueMap): UpdateIssuesAction => ({
  type: Constants.UPDATE_ISSUES,
  payload: {
    issues
  }
});

export const updateMetadata = (metadata: FlowMetadata): UpdateMetadataAction => {
  return {
    type: Constants.UPDATE_METADATA,
    payload: {
      metadata
    }
  };
};

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

export const updateAssets = (assets: AssetStore): UpdateAssetsAction => {
  const store: TembaStore = document.querySelector('temba-store');
  if (store) {
    store.setKeyedAssets('results', Object.keys(assets['results'].items));
  }

  return {
    type: Constants.UPDATE_ASSET_MAP,
    payload: {
      assets
    }
  };
};

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

export const issues = (state: {} = initialState.issues, action: ActionTypes) => {
  switch (action.type) {
    case Constants.UPDATE_ISSUES:
      return action.payload.issues;
    default:
      return state;
  }
};

export const metadata = (state: FlowMetadata = initialState.metadata, action: ActionTypes) => {
  switch (action.type) {
    case Constants.UPDATE_METADATA:
      return action.payload.metadata;
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
  issues,
  metadata,
  assetStore,
  baseLanguage,
  contactFields
});
