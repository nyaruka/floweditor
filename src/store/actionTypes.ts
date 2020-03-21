import { Type } from 'config/interfaces';
import { FlowDefinition, FlowMetadata } from 'flowTypes';
import Constants from 'store/constants';
import { EditorState } from 'store/editor';
import { Asset, AssetStore, ContactFields, RenderNodeMap, FlowIssueMap } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';

// Redux action generic
interface DuxAction<T extends Constants, P extends { [key: string]: any } = {}> {
  type: T;
  payload?: P;
}

// Payload types
interface EditorStatePayload {
  editorState: EditorState;
}

interface DefinitionPayload {
  definition: FlowDefinition;
}

interface BaseLanguagePayload {
  baseLanguage: Asset;
}

interface UpdateMetadataPayload {
  metadata: FlowMetadata;
}

interface LanguagesPayload {
  languages: Asset[];
}

interface UpdateFlowsPayload {
  flows: Array<{ uuid: string; name: string }>;
}

interface UpdateDependenciesPayload {
  dependencies: FlowDefinition[];
}

interface UpdateAssetMapPayload {
  assets: AssetStore;
}

interface UpdateNodesPayload {
  nodes: RenderNodeMap;
}

interface UpdateIssuesPayload {
  issues: FlowIssueMap;
}

interface UpdateTypeConfigPayload {
  typeConfig: Type;
}

interface UpdateUserAddingActionPayload {
  userAddingAction: boolean;
}

interface UpdateNodeEditorSettingsPayload {
  settings: NodeEditorSettings;
}

interface UpdateContactFieldsPayload {
  contactFields: ContactFields;
}

// Action types
export type UpdateNodeEditorSettings = DuxAction<
  Constants.UPDATE_NODE_EDITOR_SETTINGS,
  UpdateNodeEditorSettingsPayload
>;

export type UpdateEditorState = DuxAction<Constants.UPDATE_EDITOR_STATE, EditorStatePayload>;

export type UpdateBaseLanguageAction = DuxAction<
  Constants.UPDATE_BASE_LANGUAGE,
  BaseLanguagePayload
>;

export type UpdateLanguagesAction = DuxAction<Constants.UPDATE_LANGUAGES, LanguagesPayload>;

export type UpdateDefinitionAction = DuxAction<Constants.UPDATE_DEFINITION, DefinitionPayload>;

export type UpdateFlowsAction = DuxAction<Constants.UPDATE_FLOWS, UpdateFlowsPayload>;

export type UpdateMetadataAction = DuxAction<Constants.UPDATE_METADATA, UpdateMetadataPayload>;

export type UpdateAssetsAction = DuxAction<Constants.UPDATE_ASSET_MAP, UpdateAssetMapPayload>;

export type IncrementSuggestedResultNameCountAction = DuxAction<
  Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT
>;

export type UpdateNodesAction = DuxAction<Constants.UPDATE_NODES, UpdateNodesPayload>;

export type UpdateIssuesAction = DuxAction<Constants.UPDATE_ISSUES, UpdateIssuesPayload>;

export type UpdateTypeConfigAction = DuxAction<
  Constants.UPDATE_TYPE_CONFIG,
  UpdateTypeConfigPayload
>;

export type UpdateUserAddingActionAction = DuxAction<
  Constants.UPDATE_USER_ADDING_ACTION,
  UpdateUserAddingActionPayload
>;

export type UpdateContactFieldsAction = DuxAction<
  Constants.UPDATE_CONTACT_FIELDS,
  UpdateContactFieldsPayload
>;

export type UpdateTypeConfig = (typeConfig: Type) => UpdateTypeConfigAction;

export type UpdateUserAddingAction = (userAddingAction: boolean) => UpdateUserAddingActionAction;

export type UpdateBaseLanguage = (baseLanguage: Asset) => UpdateBaseLanguageAction;

export type IncrementSuggestedResultNameCount = () => IncrementSuggestedResultNameCountAction;

type ActionTypes =
  | UpdateEditorState
  | UpdateNodeEditorSettings
  | UpdateDefinitionAction
  | UpdateFlowsAction
  | UpdateMetadataAction
  | UpdateAssetsAction
  | IncrementSuggestedResultNameCountAction
  | UpdateNodesAction
  | UpdateIssuesAction
  | UpdateTypeConfigAction
  | UpdateUserAddingActionAction
  | UpdateBaseLanguageAction
  | UpdateLanguagesAction
  | UpdateContactFieldsAction;

export default ActionTypes;
