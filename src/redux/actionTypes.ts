import Constants from './constants';
import { Language } from '../component/LanguageSelector';
import { FlowDefinition, Position, Node, AnyAction } from '../flowTypes';
import { DragPoint } from '../component/Node';
import { Components, ContactFieldResult, SearchResult, CompletionOption } from './initialState';
import { LocalizedObject } from '../services/Localization';

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

interface UpdateResultNamePayload {
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

interface UpdateAddToNodePayload {
    addToNode: Node;
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

interface UpdateUserClickingActionPayload {
    userClickingAction: boolean;
}

interface UpdateUserClickingNodePayload {
    userClickingNode: boolean;
}

interface UpdateConfirmDeletePayload {
    confirmDelete: boolean;
}

// Action types
export interface UpdateTranslating {
    type: Constants.UPDATE_TRANSLATING;
    payload: TranslatingPayload;
}

export interface UpdateLanguage {
    type: Constants.UPDATE_LANGUAGE;
    payload: LanguagePayload;
}

export interface UpdateFetchingFlow {
    type: Constants.UPDATE_FETCHING_FLOW;
    payload: FetchingFlowPayload;
}

export interface UpdateDefinition {
    type: Constants.UPDATE_DEFINITION;
    payload: DefinitionPayload;
}

export interface UpdateNodeDragging {
    type: Constants.UPDATE_NODE_DRAGGING;
    payload: NodeDraggingPayload;
}

export interface UpdateFlows {
    type: Constants.UPDATE_FLOWS;
    payload: UpdateFlowsPayload;
}

export interface UpdateDependencies {
    type: Constants.UPDATE_DEPENDENCIES;
    payload: UpdateDependenciesPayload;
}

export interface UpdatePendingConnections {
    type: Constants.UPDATE_PENDING_CONNECTIONS;
    payload: UpdatePendingConnectionsPayload;
}

export interface RemovePendingConnection {
    type: Constants.REMOVE_PENDING_CONNECTION;
    payload: RemovePendingConnectionPayload;
}

export interface UpdateComponents {
    type: Constants.UPDATE_COMPONENTS;
    payload: UpdateComponentsPayload;
}

export interface UpdateContactFields {
    type: Constants.UPDATE_CONTACT_FIELDS;
    payload: UpdateContactFieldsPayload;
}

export interface UpdateGroups {
    type: Constants.UPDATE_GROUPS;
    payload: UpdateGroupsPayload;
}

export interface UpdateResultNames {
    type: Constants.UPDATE_RESULT_NAMES;
    payload: UpdateResultNamePayload;
}

export interface UpdateNodes {
    type: Constants.UPDATE_NODES;
    payload: UpdateNodesPayload;
}

export interface UpdateFreshestNode {
    type: Constants.UPDATE_FRESHEST_NODE;
    payload: UpdateFreshestNodePayload;
}

export interface UpdateNodeEditorOpen {
    type: Constants.UPDATE_NODE_EDITOR_OPEN;
    payload: UpdateNodeEditorOpenPayload;
}

export interface UpdateGhostNode {
    type: Constants.UPDATE_GHOST_NODE;
    payload: UpdateGhostNodePayload;
}

export interface UpdateCreateNodePosition {
    type: Constants.UPDATE_CREATE_NODE_POSITION;
    payload: UpdateCreateNodePositionPayload;
}

export interface UpdateAddToNode {
    type: Constants.UPDATE_ADD_TO_NODE;
    payload: UpdateAddToNodePayload;
}

export interface UpdatePendingConnection {
    type: Constants.UPDATE_PENDING_CONNECTION;
    payload: UpdatePendingConnectionPayload;
}

export interface UpdateActionToEdit {
    type: Constants.UPDATE_ACTION_TO_EDIT;
    payload: UpdateActionToEditPayload;
}

export interface UpdateNodeToEdit {
    type: Constants.UPDATE_NODE_TO_EDIT;
    payload: UpdateNodeToEditPayload;
}

export interface UpdateLocalizations {
    type: Constants.UPDATE_LOCALIZATIONS;
    payload: UpdateLocalizationsPayload;
}

export interface UpdateDragGroup {
    type: Constants.UPDATE_DRAG_GROUP;
    payload: UpdateDragGroupPayload;
}

export interface UpdateUserClickingAction {
    type: Constants.UPDATE_USER_CLICKING_ACTION;
    payload: UpdateUserClickingActionPayload;
}

export interface UpdateUserClickingNode {
    type: Constants.UPDATE_USER_CLICKING_NODE;
    payload: UpdateUserClickingNodePayload;
}

export interface UpdateConfirmDelete {
    type: Constants.UPDATE_CONFIRM_DELETE;
    payload: UpdateConfirmDeletePayload;
}

type ActionTypes =
    | UpdateTranslating
    | UpdateLanguage
    | UpdateFetchingFlow
    | UpdateDefinition
    | UpdateNodeDragging
    | UpdateFlows
    | UpdateDependencies
    | UpdatePendingConnections
    | RemovePendingConnection
    | UpdateComponents
    | UpdateContactFields
    | UpdateGroups
    | UpdateResultNames
    | UpdateNodes
    | UpdateFreshestNode
    | UpdateNodeEditorOpen
    | UpdateGhostNode
    | UpdateCreateNodePosition
    | UpdateAddToNode
    | UpdatePendingConnection
    | UpdateActionToEdit
    | UpdateNodeToEdit
    | UpdateLocalizations
    | UpdateDragGroup
    | UpdateUserClickingAction
    | UpdateUserClickingNode
    | UpdateConfirmDelete;

export default ActionTypes;
