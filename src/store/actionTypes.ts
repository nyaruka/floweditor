import { Type } from '~/config';
import { FlowDefinition } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import Constants from '~/store/constants';
import { EditorState } from '~/store/editor';
import { ContactFields, RenderNode, ResultMap } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';

// Redux action generic
interface DuxAction<T extends Constants, P extends { [key: string]: any } = {}> {
    type: T;
    payload?: P;
}

// Payload types
interface TranslatingPayload {
    translating: boolean;
}

interface LanguagePayload {
    language: Asset;
}

interface EditorStatePayload {
    editorState: EditorState;
}

interface FetchingFlowPayload {
    fetchingFlow: boolean;
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

interface NodeDraggingPayload {
    nodeDragging: boolean;
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

interface UpdateNodesPayload {
    nodes: { [uuid: string]: RenderNode };
}

interface UpdateNodeEditorOpenPayload {
    nodeEditorOpen: boolean;
}

interface UpdateDragGroupPayload {
    dragGroup: boolean;
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
interface UpdateTimeoutPayload {
    timeout: number;
}

interface UpdateContactFieldsPayload {
    contactFields: ContactFields;
}

// Action types
export type UpdateNodeEditorSettings = DuxAction<
    Constants.UPDATE_NODE_EDITOR_SETTINGS,
    UpdateNodeEditorSettingsPayload
>;

export type UpdateTranslatingAction = DuxAction<Constants.UPDATE_TRANSLATING, TranslatingPayload>;

export type UpdateLanguageAction = DuxAction<Constants.UPDATE_LANGUAGE, LanguagePayload>;

export type UpdateEditorState = DuxAction<Constants.UPDATE_EDITOR_STATE, EditorStatePayload>;

export type UpdateFetchingFlowAction = DuxAction<
    Constants.UPDATE_FETCHING_FLOW,
    FetchingFlowPayload
>;

export type UpdateBaseLanguageAction = DuxAction<
    Constants.UPDATE_BASE_LANGUAGE,
    BaseLanguagePayload
>;

export type UpdateLanguagesAction = DuxAction<Constants.UPDATE_LANGUAGES, LanguagesPayload>;

export type UpdateDefinitionAction = DuxAction<Constants.UPDATE_DEFINITION, DefinitionPayload>;

export type UpdateNodeDraggingAction = DuxAction<
    Constants.UPDATE_NODE_DRAGGING,
    NodeDraggingPayload
>;

export type UpdateFlowsAction = DuxAction<Constants.UPDATE_FLOWS, UpdateFlowsPayload>;

export type UpdateDependenciesAction = DuxAction<
    Constants.UPDATE_DEPENDENCIES,
    UpdateDependenciesPayload
>;

export type UpdateResultMapAction = DuxAction<Constants.UPDATE_RESULT_MAP, UpdateResultMapPayload>;

export type IncrementSuggestedResultNameCountAction = DuxAction<
    Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT
>;

export type UpdateNodesAction = DuxAction<Constants.UPDATE_NODES, UpdateNodesPayload>;

export type UpdateNodeEditorOpenAction = DuxAction<
    Constants.UPDATE_NODE_EDITOR_OPEN,
    UpdateNodeEditorOpenPayload
>;

export type UpdateDragGroupAction = DuxAction<Constants.UPDATE_DRAG_GROUP, UpdateDragGroupPayload>;

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

export type UpdateNodeDragging = (nodeDragging: boolean) => UpdateNodeDraggingAction;

export type UpdateDragGroup = (dragGroup: boolean) => UpdateDragGroupAction;

export type UpdateTranslating = (translating: boolean) => UpdateTranslatingAction;

export type UpdateLanguage = (language: Asset) => UpdateLanguageAction;

export type UpdateTypeConfig = (typeConfig: Type) => UpdateTypeConfigAction;

export type UpdateUserAddingAction = (userAddingAction: boolean) => UpdateUserAddingActionAction;

export type UpdateNodeEditorOpen = (nodeEditorOpen: boolean) => UpdateNodeEditorOpenAction;

export type UpdateBaseLanguage = (baseLanguage: Asset) => UpdateBaseLanguageAction;

export type IncrementSuggestedResultNameCount = () => IncrementSuggestedResultNameCountAction;

type ActionTypes =
    | UpdateEditorState
    | UpdateNodeEditorSettings
    | UpdateTranslatingAction
    | UpdateLanguageAction
    | UpdateFetchingFlowAction
    | UpdateDefinitionAction
    | UpdateNodeDraggingAction
    | UpdateFlowsAction
    | UpdateDependenciesAction
    | UpdateResultMapAction
    | IncrementSuggestedResultNameCountAction
    | UpdateNodesAction
    | UpdateNodeEditorOpenAction
    | UpdateDragGroupAction
    | UpdateTypeConfigAction
    | UpdateUserAddingActionAction
    | UpdateBaseLanguageAction
    | UpdateLanguagesAction
    | UpdateContactFieldsAction;

export default ActionTypes;
