import { Type } from '~/config';
import { FlowDefinition } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import Constants from '~/store/constants';
import { EditorState } from '~/store/editor';
import { AssetStore, ContactFields, RenderNodeMap, ResultMap } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';

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

interface LanguagesPayload {
    languages: Asset[];
}

interface UpdateFlowsPayload {
    flows: Array<{ uuid: string; name: string }>;
}

interface UpdateDependenciesPayload {
    dependencies: FlowDefinition[];
}

interface UpdateResultMapPayload {
    resultMap: ResultMap;
}

interface UpdateAssetMapPayload {
    assets: AssetStore;
}

interface UpdateNodesPayload {
    nodes: RenderNodeMap;
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

export type UpdateDependenciesAction = DuxAction<
    Constants.UPDATE_DEPENDENCIES,
    UpdateDependenciesPayload
>;

export type UpdateResultMapAction = DuxAction<Constants.UPDATE_RESULT_MAP, UpdateResultMapPayload>;

export type UpdateAssetsAction = DuxAction<Constants.UPDATE_ASSET_MAP, UpdateAssetMapPayload>;

export type IncrementSuggestedResultNameCountAction = DuxAction<
    Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT
>;

export type UpdateNodesAction = DuxAction<Constants.UPDATE_NODES, UpdateNodesPayload>;

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
    | UpdateDependenciesAction
    | UpdateResultMapAction
    | UpdateAssetsAction
    | IncrementSuggestedResultNameCountAction
    | UpdateNodesAction
    | UpdateTypeConfigAction
    | UpdateUserAddingActionAction
    | UpdateBaseLanguageAction
    | UpdateLanguagesAction
    | UpdateContactFieldsAction;

export default ActionTypes;
