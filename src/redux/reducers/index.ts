import { combineReducers } from 'redux';
import translating from './translating';
import language from './language';
import fetchingFlow from './fetchingFlow';
import definition from './definition';
import nodeDragging from './nodeDragging';
import flows from './flows';
import dependencies from './dependencies';
import components from './components';
import contactFields from './contactFields';
import resultNames from './resultNames';
import groups from './groups';
import nodes from './nodes';
import pendingConnections from './pendingConnections';
import freshestNode from './freshestNode';
import createNodePosition from './createNodePosition';
import addToNode from './addToNode';
import pendingConnection from './pendingConnection';
import ghostNode from './ghostNode';
import nodeToEdit from './nodeToEdit';
import actionToEdit from './actionToEdit';
import localizations from './localizations';
import dragGroup from './dragGroup';
import userClickingNode from './userClickingNode';
import userClickingAction from './userClickingAction';
import nodeEditorOpen from './nodeEditorOpen';
import confirmDelete from './confirmDelete';

const rootReducer = combineReducers({
    translating,
    language,
    fetchingFlow,
    definition,
    nodeDragging,
    flows,
    dependencies,
    components,
    contactFields,
    resultNames,
    groups,
    nodes,
    pendingConnections,
    freshestNode,
    createNodePosition,
    addToNode,
    pendingConnection,
    ghostNode,
    nodeToEdit,
    actionToEdit,
    localizations,
    dragGroup,
    userClickingNode,
    userClickingAction,
    nodeEditorOpen,
    confirmDelete
});

export default rootReducer;
