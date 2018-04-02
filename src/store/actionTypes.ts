import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { Type } from '../config';
import { AnyAction, FlowDefinition, Node, Position } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import Constants from './constants';
import { ContactFieldResult, SearchResult, CompletionOption, RenderNode } from './flowContext';

// Redux action generic
interface DuxAction<T extends Constants, P extends { [key: string]: any }> {
    type: T;
    payload: P;
}

// Payload types
interface TranslatingPayload {
    translating: boolean;
}

interface LanguagePayload {
    language: Language;
}

interface FetchingFlowPayload {
    fetchingFlow: boolean;
}

interface DefinitionPayload {
    definition: FlowDefinition;
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

interface UpdatePendingConnectionsPayload {
    draggedTo: string;
    draggedFrom: DragPoint;
}

interface RemovePendingConnectionPayload {
    nodeUUID: string;
}

interface UpdateContactFieldsPayload {
    contactFields: ContactFieldResult[];
}

interface UpdateGroupsPayload {
    groups: SearchResult[];
}

interface UpdateResultNamesPayload {
    resultNames: CompletionOption[];
}

interface UpdateNodesPayload {
    nodes: { [uuid: string]: RenderNode };
}

interface UpdateNodeEditorOpenPayload {
    nodeEditorOpen: boolean;
}

interface UpdateGhostNodePayload {
    ghostNode: Node;
}

interface UpdateCreateNodePositionPayload {
    createNodePosition: Position;
}

interface UpdatePendingConnectionPayload {
    pendingConnection: DragPoint;
}

interface UpdateActionToEditPayload {
    actionToEdit: AnyAction;
}

interface UpdateNodeToEditPayload {
    nodeToEdit: Node;
}

interface UpdateLocalizationsPayload {
    localizations: LocalizedObject[];
}

interface UpdateDragGroupPayload {
    dragGroup: boolean;
}

interface UpdateTypeConfigPayload {
    typeConfig: Type;
}

interface UpdateResultNamePayload {
    resultName: string;
}

interface UpdateOperandPayload {
    operand: string;
}

interface UpdateUserAddingActionPayload {
    userAddingAction: boolean;
}

interface UpdateShowResultNameActionPayload {
    showResultName: boolean;
}

// Action types
export type UpdateTranslatingAction = DuxAction<Constants.UPDATE_TRANSLATING, TranslatingPayload>;

export type UpdateLanguageAction = DuxAction<Constants.UPDATE_LANGUAGE, LanguagePayload>;

export type UpdateFetchingFlowAction = DuxAction<
    Constants.UPDATE_FETCHING_FLOW,
    FetchingFlowPayload
>;

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

export type UpdatePendingConnectionsAction = DuxAction<
    Constants.UPDATE_PENDING_CONNECTIONS,
    UpdatePendingConnectionsPayload
>;

export type RemovePendingConnectionAction = DuxAction<
    Constants.REMOVE_PENDING_CONNECTION,
    RemovePendingConnectionPayload
>;

export type UpdateContactFieldsAction = DuxAction<
    Constants.UPDATE_CONTACT_FIELDS,
    UpdateContactFieldsPayload
>;

export type UpdateGroupsAction = DuxAction<Constants.UPDATE_GROUPS, UpdateGroupsPayload>;

export type UpdateResultNamesAction = DuxAction<
    Constants.UPDATE_RESULT_NAMES,
    UpdateResultNamesPayload
>;

export type UpdateNodesAction = DuxAction<Constants.UPDATE_NODES, UpdateNodesPayload>;

export type UpdateNodeEditorOpenAction = DuxAction<
    Constants.UPDATE_NODE_EDITOR_OPEN,
    UpdateNodeEditorOpenPayload
>;

export type UpdateGhostNodeAction = DuxAction<Constants.UPDATE_GHOST_NODE, UpdateGhostNodePayload>;

export type UpdateCreateNodePositionAction = DuxAction<
    Constants.UPDATE_CREATE_NODE_POSITION,
    UpdateCreateNodePositionPayload
>;

export type UpdatePendingConnectionAction = DuxAction<
    Constants.UPDATE_PENDING_CONNECTION,
    UpdatePendingConnectionPayload
>;

export type UpdateActionToEditAction = DuxAction<
    Constants.UPDATE_ACTION_TO_EDIT,
    UpdateActionToEditPayload
>;

export type UpdateNodeToEditAction = DuxAction<
    Constants.UPDATE_NODE_TO_EDIT,
    UpdateNodeToEditPayload
>;

export type UpdateLocalizationsAction = DuxAction<
    Constants.UPDATE_LOCALIZATIONS,
    UpdateLocalizationsPayload
>;

export type UpdateDragGroupAction = DuxAction<Constants.UPDATE_DRAG_GROUP, UpdateDragGroupPayload>;

export type UpdateTypeConfigAction = DuxAction<
    Constants.UPDATE_TYPE_CONFIG,
    UpdateTypeConfigPayload
>;

export type UpdateResultNameAction = DuxAction<
    Constants.UPDATE_RESULT_NAME,
    UpdateResultNamePayload
>;

export type UpdateOperandAction = DuxAction<Constants.UPDATE_OPERAND, UpdateOperandPayload>;

export type UpdateUserAddingActionAction = DuxAction<
    Constants.UPDATE_USER_ADDING_ACTION,
    UpdateUserAddingActionPayload
>;

export type UpdateShowResultNameAction = DuxAction<
    Constants.UPDATE_SHOW_RESULT_NAME,
    UpdateShowResultNameActionPayload
>;

export type UpdateNodeDragging = (nodeDragging: boolean) => UpdateNodeDraggingAction;

export type UpdateDragGroup = (dragGroup: boolean) => UpdateDragGroupAction;

export type UpdateTranslating = (translating: boolean) => UpdateTranslatingAction;

export type UpdateLanguage = (language: Language) => UpdateLanguageAction;

export type UpdateCreateNodePosition = (
    createNodePosition: Position
) => UpdateCreateNodePositionAction;

export type UpdateResultName = (resultName: string) => UpdateResultNameAction;

export type UpdateOperand = (operand: string) => UpdateOperandAction;

export type UpdateTypeConfig = (typeConfig: Type) => UpdateTypeConfigAction;

export type UpdateUserAddingAction = (userAddingAction: boolean) => UpdateUserAddingActionAction;

export type UpdateNodeEditorOpen = (nodeEditorOpen: boolean) => UpdateNodeEditorOpenAction;

export type UpdateShowResultName = (showResultName: boolean) => UpdateShowResultNameAction;

type ActionTypes =
    | UpdateTranslatingAction
    | UpdateLanguageAction
    | UpdateFetchingFlowAction
    | UpdateDefinitionAction
    | UpdateNodeDraggingAction
    | UpdateFlowsAction
    | UpdateDependenciesAction
    | UpdatePendingConnectionsAction
    | RemovePendingConnectionAction
    | UpdateContactFieldsAction
    | UpdateGroupsAction
    | UpdateResultNamesAction
    | UpdateNodesAction
    | UpdateNodeEditorOpenAction
    | UpdateGhostNodeAction
    | UpdateCreateNodePositionAction
    | UpdatePendingConnectionAction
    | UpdateActionToEditAction
    | UpdateNodeToEditAction
    | UpdateLocalizationsAction
    | UpdateDragGroupAction
    | UpdateTypeConfigAction
    | UpdateResultNameAction
    | UpdateOperandAction
    | UpdateUserAddingActionAction
    | UpdateShowResultNameAction;

export default ActionTypes;
