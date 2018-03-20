import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { Type } from '../config';
import { AnyAction, FlowDefinition, Node, Position } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import Constants from './constants';
import { Components, ContactFieldResult, SearchResult, CompletionOption } from './flowContext';

// Payload types
interface TranslatingPayload {
    [translating: string]: boolean;
}

interface LanguagePayload {
    [language: string]: Language;
}

interface FetchingFlowPayload {
    [fetchingFlow: string]: boolean;
}

interface DefinitionPayload {
    [definition: string]: FlowDefinition;
}

interface NodeDraggingPayload {
    [nodeDragging: string]: boolean;
}

interface UpdateFlowsPayload {
    [flows: string]: Array<{ uuid: string; name: string }>;
}

interface UpdateDependenciesPayload {
    [dependencies: string]: FlowDefinition[];
}

interface UpdatePendingConnectionsPayload {
    draggedTo: string;
    draggedFrom: DragPoint;
}

interface RemovePendingConnectionPayload {
    nodeUUID: string;
}

interface UpdateComponentsPayload {
    components: Components;
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
    nodes: Node[];
}

interface UpdateFreshestNodePayload {
    freshestNode: Node;
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
export interface UpdateTranslatingAction {
    type: Constants.UPDATE_TRANSLATING;
    payload: TranslatingPayload;
}

export interface UpdateLanguageAction {
    type: Constants.UPDATE_LANGUAGE;
    payload: LanguagePayload;
}

export interface UpdateFetchingFlowAction {
    type: Constants.UPDATE_FETCHING_FLOW;
    payload: FetchingFlowPayload;
}

export interface UpdateDefinitionAction {
    type: Constants.UPDATE_DEFINITION;
    payload: DefinitionPayload;
}

export interface UpdateNodeDraggingAction {
    type: Constants.UPDATE_NODE_DRAGGING;
    payload: NodeDraggingPayload;
}

export interface UpdateFlowsAction {
    type: Constants.UPDATE_FLOWS;
    payload: UpdateFlowsPayload;
}

export interface UpdateDependenciesAction {
    type: Constants.UPDATE_DEPENDENCIES;
    payload: UpdateDependenciesPayload;
}

export interface UpdatePendingConnectionsAction {
    type: Constants.UPDATE_PENDING_CONNECTIONS;
    payload: UpdatePendingConnectionsPayload;
}

export interface RemovePendingConnectionAction {
    type: Constants.REMOVE_PENDING_CONNECTION;
    payload: RemovePendingConnectionPayload;
}

export interface UpdateComponentsAction {
    type: Constants.UPDATE_COMPONENTS;
    payload: UpdateComponentsPayload;
}

export interface UpdateContactFieldsAction {
    type: Constants.UPDATE_CONTACT_FIELDS;
    payload: UpdateContactFieldsPayload;
}

export interface UpdateGroupsAction {
    type: Constants.UPDATE_GROUPS;
    payload: UpdateGroupsPayload;
}

export interface UpdateResultNamesAction {
    type: Constants.UPDATE_RESULT_NAMES;
    payload: UpdateResultNamesPayload;
}

export interface UpdateNodesAction {
    type: Constants.UPDATE_NODES;
    payload: UpdateNodesPayload;
}

export interface UpdateFreshestNodeAction {
    type: Constants.UPDATE_FRESHEST_NODE;
    payload: UpdateFreshestNodePayload;
}

export interface UpdateNodeEditorOpenAction {
    type: Constants.UPDATE_NODE_EDITOR_OPEN;
    payload: UpdateNodeEditorOpenPayload;
}

export interface UpdateGhostNodeAction {
    type: Constants.UPDATE_GHOST_NODE;
    payload: UpdateGhostNodePayload;
}

export interface UpdateCreateNodePositionAction {
    type: Constants.UPDATE_CREATE_NODE_POSITION;
    payload: UpdateCreateNodePositionPayload;
}

export interface UpdatePendingConnectionAction {
    type: Constants.UPDATE_PENDING_CONNECTION;
    payload: UpdatePendingConnectionPayload;
}

export interface UpdateActionToEditAction {
    type: Constants.UPDATE_ACTION_TO_EDIT;
    payload: UpdateActionToEditPayload;
}

export interface UpdateNodeToEditAction {
    type: Constants.UPDATE_NODE_TO_EDIT;
    payload: UpdateNodeToEditPayload;
}

export interface UpdateLocalizationsAction {
    type: Constants.UPDATE_LOCALIZATIONS;
    payload: UpdateLocalizationsPayload;
}

export interface UpdateDragGroupAction {
    type: Constants.UPDATE_DRAG_GROUP;
    payload: UpdateDragGroupPayload;
}

export interface UpdateTypeConfigAction {
    type: Constants.UPDATE_TYPE_CONFIG;
    payload: UpdateTypeConfigPayload;
}

export interface UpdateResultNameAction {
    type: Constants.UPDATE_RESULT_NAME;
    payload: UpdateResultNamePayload;
}

export interface UpdateOperandAction {
    type: Constants.UPDATE_OPERAND;
    payload: UpdateOperandPayload;
}

export interface UpdateUserAddingActionAction {
    type: Constants.UPDATE_USER_ADDING_ACTION;
    payload: UpdateUserAddingActionPayload;
}

export interface UpdateShowResultNameAction {
    type: Constants.UPDATE_SHOW_RESULT_NAME;
    payload: UpdateShowResultNameActionPayload;
}

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
    | UpdateComponentsAction
    | UpdateContactFieldsAction
    | UpdateGroupsAction
    | UpdateResultNamesAction
    | UpdateNodesAction
    | UpdateFreshestNodeAction
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
