import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { AnyAction, FlowDefinition, Node, Position } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import {
    UpdateDefinitionAction,
    UpdateDependenciesAction,
    UpdateFetchingFlowAction,
    UpdateFlowsAction,
    UpdateLanguageAction,
    UpdateNodeDraggingAction,
    UpdateTranslatingAction,
    UpdatePendingConnectionsAction,
    UpdateUserAddingActionAction,
    UpdateOperandAction,
    UpdateShowResultNameAction,
    UpdateResultNameAction,
    UpdateTypeConfigAction,
    UpdateUserClickingActionAction,
    UpdateUserClickingNodeAction,
    UpdateDragGroupAction,
    UpdateLocalizationsAction,
    UpdateNodeToEditAction,
    UpdateActionToEditAction,
    UpdatePendingConnectionAction,
    UpdateCreateNodePositionAction,
    UpdateGhostNodeAction,
    UpdateNodeEditorOpenAction,
    UpdateFreshestNodeAction,
    UpdateNodesAction,
    UpdateResultNamesAction,
    UpdateGroupsAction,
    UpdateContactFieldsAction,
    UpdateComponentsAction,
    RemovePendingConnectionAction
} from './actionTypes';
import Constants from './constants';
import {
    CompletionOption,
    Components,
    ContactFieldResult,
    Flows,
    SearchResult
} from './initialState';
import { Type } from '../config';

export const updateTranslating = (translating: boolean): UpdateTranslatingAction => ({
    type: Constants.UPDATE_TRANSLATING,
    payload: {
        translating
    }
});

export const updateLanguage = (language: Language): UpdateLanguageAction => ({
    type: Constants.UPDATE_LANGUAGE,
    payload: {
        language
    }
});

export const updateFetchingFlow = (fetchingFlow: boolean): UpdateFetchingFlowAction => ({
    type: Constants.UPDATE_FETCHING_FLOW,
    payload: {
        fetchingFlow
    }
});

export const updateDefinition = (definition: FlowDefinition): UpdateDefinitionAction => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

export const updateNodeDragging = (nodeDragging: boolean): UpdateNodeDraggingAction => ({
    type: Constants.UPDATE_NODE_DRAGGING,
    payload: {
        nodeDragging
    }
});

export const updateFlows = (flows: Flows): UpdateFlowsAction => ({
    type: Constants.UPDATE_FLOWS,
    payload: {
        flows
    }
});

export const updateDependencies = (dependencies: FlowDefinition[]): UpdateDependenciesAction => ({
    type: Constants.UPDATE_DEPENDENCIES,
    payload: {
        dependencies
    }
});

export const updatePendingConnections = (
    draggedTo: string,
    draggedFrom: DragPoint
): UpdatePendingConnectionsAction => ({
    type: Constants.UPDATE_PENDING_CONNECTIONS,
    payload: {
        draggedTo,
        draggedFrom
    }
});

export const removePendingConnection = (nodeUUID: string): RemovePendingConnectionAction => ({
    type: Constants.REMOVE_PENDING_CONNECTION,
    payload: {
        nodeUUID
    }
});

export const updateComponents = (components: Components): UpdateComponentsAction => ({
    type: Constants.UPDATE_COMPONENTS,
    payload: {
        components
    }
});

export const updateContactFields = (
    contactFields: ContactFieldResult[]
): UpdateContactFieldsAction => ({
    type: Constants.UPDATE_CONTACT_FIELDS,
    payload: {
        contactFields
    }
});

export const updateGroups = (groups: SearchResult[]): UpdateGroupsAction => ({
    type: Constants.UPDATE_GROUPS,
    payload: {
        groups
    }
});

export const updateResultNames = (resultNames: CompletionOption[]): UpdateResultNamesAction => ({
    type: Constants.UPDATE_RESULT_NAMES,
    payload: {
        resultNames
    }
});

export const updateNodes = (nodes: Node[]): UpdateNodesAction => ({
    type: Constants.UPDATE_NODES,
    payload: {
        nodes
    }
});

export const updateFreshestNode = (freshestNode: Node): UpdateFreshestNodeAction => ({
    type: Constants.UPDATE_FRESHEST_NODE,
    payload: {
        freshestNode
    }
});

export const updateNodeEditorOpen = (nodeEditorOpen: boolean): UpdateNodeEditorOpenAction => ({
    type: Constants.UPDATE_NODE_EDITOR_OPEN,
    payload: {
        nodeEditorOpen
    }
});

export const updateGhostNode = (ghostNode: Node): UpdateGhostNodeAction => ({
    type: Constants.UPDATE_GHOST_NODE,
    payload: {
        ghostNode
    }
});

export const updateCreateNodePosition = (
    createNodePosition: Position
): UpdateCreateNodePositionAction => ({
    type: Constants.UPDATE_CREATE_NODE_POSITION,
    payload: {
        createNodePosition
    }
});

export const updatePendingConnection = (
    pendingConnection: DragPoint
): UpdatePendingConnectionAction => ({
    type: Constants.UPDATE_PENDING_CONNECTION,
    payload: {
        pendingConnection
    }
});

export const updateActionToEdit = (actionToEdit: AnyAction): UpdateActionToEditAction => ({
    type: Constants.UPDATE_ACTION_TO_EDIT,
    payload: {
        actionToEdit
    }
});

export const updateNodeToEdit = (nodeToEdit: Node): UpdateNodeToEditAction => ({
    type: Constants.UPDATE_NODE_TO_EDIT,
    payload: {
        nodeToEdit
    }
});

export const updateLocalizations = (
    localizations: LocalizedObject[]
): UpdateLocalizationsAction => ({
    type: Constants.UPDATE_LOCALIZATIONS,
    payload: {
        localizations
    }
});

export const updateDragGroup = (dragGroup: boolean): UpdateDragGroupAction => ({
    type: Constants.UPDATE_DRAG_GROUP,
    payload: {
        dragGroup
    }
});

export const updateUserClickingNode = (
    userClickingNode: boolean
): UpdateUserClickingNodeAction => ({
    type: Constants.UPDATE_USER_CLICKING_NODE,
    payload: {
        userClickingNode
    }
});

export const updateUserClickingAction = (
    userClickingAction: boolean
): UpdateUserClickingActionAction => ({
    type: Constants.UPDATE_USER_CLICKING_ACTION,
    payload: {
        userClickingAction
    }
});

export const updateTypeConfig = (typeConfig: Type): UpdateTypeConfigAction => ({
    type: Constants.UPDATE_TYPE_CONFIG,
    payload: {
        typeConfig
    }
});

export const updateResultName = (resultName: string): UpdateResultNameAction => ({
    type: Constants.UPDATE_RESULT_NAME,
    payload: {
        resultName
    }
});

export const updateShowResultName = (showResultName: boolean): UpdateShowResultNameAction => ({
    type: Constants.UPDATE_SHOW_RESULT_NAME,
    payload: {
        showResultName
    }
});

export const updateOperand = (operand: string): UpdateOperandAction => ({
    type: Constants.UPDATE_OPERAND,
    payload: {
        operand
    }
});

export const updateUserAddingAction = (
    userAddingAction: boolean
): UpdateUserAddingActionAction => ({
    type: Constants.UPDATE_USER_ADDING_ACTION,
    payload: {
        userAddingAction
    }
});
