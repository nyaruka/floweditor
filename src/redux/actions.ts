import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import { AnyAction, FlowDefinition, Node, Position } from '../flowTypes';
import { LocalizedObject } from '../services/Localization';
import {
    UpdateDefinition,
    UpdateDependencies,
    UpdateFetchingFlow,
    UpdateFlows,
    UpdateLanguage,
    UpdateNodeDragging,
    UpdateTranslating
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

export const updateTranslating = (translating: boolean): UpdateTranslating => ({
    type: Constants.UPDATE_TRANSLATING,
    payload: {
        translating
    }
});

export const updateLanguage = (language: Language): UpdateLanguage => ({
    type: Constants.UPDATE_LANGUAGE,
    payload: {
        language
    }
});

export const updateFetchingFlow = (fetchingFlow: boolean): UpdateFetchingFlow => ({
    type: Constants.UPDATE_FETCHING_FLOW,
    payload: {
        fetchingFlow
    }
});

export const updateDefinition = (definition: FlowDefinition): UpdateDefinition => ({
    type: Constants.UPDATE_DEFINITION,
    payload: {
        definition
    }
});

export const updateNodeDragging = (nodeDragging: boolean): UpdateNodeDragging => ({
    type: Constants.UPDATE_NODE_DRAGGING,
    payload: {
        nodeDragging
    }
});

export const updateFlows = (flows: Flows): UpdateFlows => ({
    type: Constants.UPDATE_FLOWS,
    payload: {
        flows
    }
});

export const updateDependencies = (dependencies: FlowDefinition[]): UpdateDependencies => ({
    type: Constants.UPDATE_DEPENDENCIES,
    payload: {
        dependencies
    }
});

export const updatePendingConnections = (draggedTo: string, draggedFrom: DragPoint) => ({
    type: Constants.UPDATE_PENDING_CONNECTIONS,
    payload: {
        draggedTo,
        draggedFrom
    }
});

export const removePendingConnection = (nodeUUID: string) => ({
    type: Constants.REMOVE_PENDING_CONNECTION,
    payload: {
        nodeUUID
    }
});

export const updateComponents = (components: Components) => ({
    type: Constants.UPDATE_COMPONENTS,
    payload: {
        components
    }
});

export const updateContactFields = (contactFields: ContactFieldResult[]) => ({
    type: Constants.UPDATE_CONTACT_FIELDS,
    payload: {
        contactFields
    }
});

export const updateGroups = (groups: SearchResult[]) => ({
    type: Constants.UPDATE_GROUPS,
    payload: {
        groups
    }
});

export const updateResultNames = (resultNames: CompletionOption[]) => ({
    type: Constants.UPDATE_RESULT_NAMES,
    payload: {
        resultNames
    }
});

export const updateNodes = (nodes: Node[]) => ({
    type: Constants.UPDATE_NODES,
    payload: {
        nodes
    }
});

export const updateFreshestNode = (freshestNode: Node) => ({
    type: Constants.UPDATE_FRESHEST_NODE,
    payload: {
        freshestNode
    }
});

export const updateNodeEditorOpen = (nodeEditorOpen: boolean) => ({
    type: Constants.UPDATE_NODE_EDITOR_OPEN,
    payload: {
        nodeEditorOpen
    }
});

export const updateGhostNode = (ghostNode: Node) => ({
    type: Constants.UPDATE_GHOST_NODE,
    payload: {
        ghostNode
    }
});

export const updateCreateNodePosition = (createNodePosition: Position) => ({
    type: Constants.UPDATE_CREATE_NODE_POSITION,
    payload: {
        createNodePosition
    }
});

export const updatePendingConnection = (pendingConnection: DragPoint) => ({
    type: Constants.UPDATE_PENDING_CONNECTION,
    payload: {
        pendingConnection
    }
});

export const updateActionToEdit = (actionToEdit: AnyAction) => ({
    type: Constants.UPDATE_ACTION_TO_EDIT,
    payload: {
        actionToEdit
    }
});

export const updateNodeToEdit = (nodeToEdit: Node) => ({
    type: Constants.UPDATE_NODE_TO_EDIT,
    payload: {
        nodeToEdit
    }
});

export const updateLocalizations = (localizations: LocalizedObject[]) => ({
    type: Constants.UPDATE_LOCALIZATIONS,
    payload: {
        localizations
    }
});

export const updateDragGroup = (dragGroup: boolean) => ({
    type: Constants.UPDATE_DRAG_GROUP,
    payload: {
        dragGroup
    }
});

export const updateUserClickingNode = (userClickingNode: boolean) => ({
    type: Constants.UPDATE_USER_CLICKING_NODE,
    payload: {
        userClickingNode
    }
});

export const updateUserClickingAction = (userClickingAction: boolean) => ({
    type: Constants.UPDATE_USER_CLICKING_ACTION,
    payload: {
        userClickingAction
    }
});

export const updateTypeConfig = (typeConfig: Type) => ({
    type: Constants.UPDATE_TYPE_CONFIG,
    payload: {
        typeConfig
    }
});

export const updateResultName = (resultName: string) => ({
    type: Constants.UPDATE_RESULT_NAME,
    payload: {
        resultName
    }
});

export const updateShowResultName = (showResultName: boolean) => ({
    type: Constants.UPDATE_SHOW_RESULT_NAME,
    payload: {
        showResultName
    }
});

export const updateOperand = (operand: string) => ({
    type: Constants.UPDATE_OPERAND,
    payload: {
        operand
    }
});

export const updateUserAddingAction = (userAddingAction: boolean) => ({
    type: Constants.UPDATE_USER_ADDING_ACTION,
    payload: {
        userAddingAction
    }
});
