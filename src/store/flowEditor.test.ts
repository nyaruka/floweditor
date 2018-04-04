import { v4 as generateUUID } from 'uuid';
import Constants from './constants';
import {
    createNodePosition as createNodePositionReducer,
    dragGroup as dragGroupReducer,
    fetchingFlow as fetchingFlowReducer,
    flows as flowsReducer,
    ghostNode as ghostNodeReducer,
    initialState,
    language as languageReducer,
    nodeDragging as nodeDraggingReducer,
    nodeEditorOpen as nodeEditorOpenReducer,
    pendingConnection as pendingConnectionReducer,
    pendingConnections as pendingConnectionsReducer,
    removePendingConnection,
    translating as translatingReducer,
    updateCreateNodePosition,
    updateDragGroup,
    updateFetchingFlow,
    updateFlows,
    updateGhostNode,
    updateLanguage,
    updateNodeDragging,
    updateNodeEditorOpen,
    updatePendingConnection,
    updatePendingConnections,
    updateTranslating
} from './flowEditor';
import { getGhostNode } from './helpers';
import { FlowNode } from '../flowTypes';
import { RenderNode } from './flowContext';

const config = require('../../assets/config');
const flowsResp = require('../../assets/flows.json');
const colorsFlow = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

describe('flowEditor action creators', () => {
    describe('updateTranslating', () => {
        it('should create an action to update translating state', () => {
            const translating = true;
            const expectedAction = {
                type: Constants.UPDATE_TRANSLATING,
                payload: {
                    translating
                }
            };
            expect(updateTranslating(translating)).toEqual(expectedAction);
        });
    });

    describe('updateLanguage', () => {
        it('should create an action to update language state', () => {
            const iso = Object.keys(config.languages)[0];
            const language = {
                name: config.languages[iso],
                iso
            };
            const expectedAction = {
                type: Constants.UPDATE_LANGUAGE,
                payload: {
                    language
                }
            };
            expect(updateLanguage(language)).toEqual(expectedAction);
        });
    });

    describe('updateFetchingFlow', () => {
        it('should create an action to update fetchingFlow state', () => {
            const fetchingFlow = true;
            const expectedAction = {
                type: Constants.UPDATE_FETCHING_FLOW,
                payload: {
                    fetchingFlow
                }
            };
            expect(updateFetchingFlow(fetchingFlow)).toEqual(expectedAction);
        });
    });

    describe('updateNodeEditorOpen', () => {
        it('should create an action to update nodeEditor state', () => {
            const nodeEditorOpen = true;
            const expectedAction = {
                type: Constants.UPDATE_NODE_EDITOR_OPEN,
                payload: {
                    nodeEditorOpen
                }
            };
            expect(updateNodeEditorOpen(nodeEditorOpen)).toEqual(expectedAction);
        });
    });

    describe('updateFlows', () => {
        it('should create an action to update flows state', () => {
            const { response: flows } = flowsResp;
            const expectedAction = {
                type: Constants.UPDATE_FLOWS,
                payload: {
                    flows
                }
            };
            expect(updateFlows(flows)).toEqual(expectedAction);
        });
    });

    describe('updateCreateNodePosition', () => {
        it('should create an action to update createNodePosition state', () => {
            const createNodePosition = { left: 100, top: 250 };
            const expectedAction = {
                type: Constants.UPDATE_CREATE_NODE_POSITION,
                payload: {
                    createNodePosition
                }
            };
            expect(updateCreateNodePosition(createNodePosition)).toEqual(expectedAction);
        });
    });

    describe('updatePendingConnection', () => {
        it('should create an action to update pendingConnection state', () => {
            const pendingConnection = {
                nodeUUID: generateUUID(),
                exitUUID: generateUUID()
            };
            const expectedAction = {
                type: Constants.UPDATE_PENDING_CONNECTION,
                payload: {
                    pendingConnection
                }
            };
            expect(updatePendingConnection(pendingConnection)).toEqual(expectedAction);
        });
    });

    describe('updatePendingConnections', () => {
        it('should create an action to update pendingConnections state', () => {
            const draggedTo = generateUUID();
            const draggedFrom = {
                nodeUUID: generateUUID(),
                exitUUID: generateUUID()
            };
            const expectedAction = {
                type: Constants.UPDATE_PENDING_CONNECTIONS,
                payload: {
                    draggedTo,
                    draggedFrom
                }
            };
            expect(updatePendingConnections(draggedTo, draggedFrom)).toEqual(expectedAction);
        });
    });

    describe('removePendingConnection', () => {
        it('should create an action to update pendingConnections state', () => {
            const nodeUUID = generateUUID();
            const expectedAction = {
                type: Constants.REMOVE_PENDING_CONNECTION,
                payload: {
                    nodeUUID
                }
            };
            expect(removePendingConnection(nodeUUID)).toEqual(expectedAction);
        });
    });

    describe('updateGhostNode', () => {
        it('should create an action to update ghostNode state', () => {
            const { definition } = colorsFlow.results[0];
            const fromNode: RenderNode = {
                node: definition.nodes[0],
                ui: definition._ui.nodes[definition.nodes[0].uuid],
                inboundConnections: {}
            };

            const ghostNode = getGhostNode(fromNode, definition);
            const expectedAction = {
                type: Constants.UPDATE_GHOST_NODE,
                payload: {
                    ghostNode
                }
            };
            expect(updateGhostNode(ghostNode)).toEqual(expectedAction);
        });
    });

    describe('updateNodeDragging', () => {
        it('should create an action to update nodeDragging state', () => {
            const nodeDragging = true;
            const expectedAction = {
                type: Constants.UPDATE_NODE_DRAGGING,
                payload: {
                    nodeDragging
                }
            };
            expect(updateNodeDragging(nodeDragging)).toEqual(expectedAction);
        });
    });

    describe('updateDragGroup', () => {
        it('should create an action to update dragGroup state', () => {
            const dragGroup = true;
            const expectedAction = {
                type: Constants.UPDATE_DRAG_GROUP,
                payload: {
                    dragGroup
                }
            };
            expect(updateDragGroup(dragGroup)).toEqual(expectedAction);
        });
    });
});

describe('flowEditor reducers', () => {
    describe('language reducer', () => {
        const reduce = action => languageReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.editorUI.language);
        });

        it('should handle UPDATE_LANGUAGE', () => {
            const iso = Object.keys(config.languages)[0];
            const language = {
                name: config.languages[iso],
                iso
            };
            const action = updateLanguage(language);
            expect(reduce(action)).toEqual(language);
        });
    });

    describe('translating reducer', () => {
        const reduce = action => translatingReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.editorUI.translating);
        });

        it('should handle UPDATE_TRANSLATING', () => {
            const translating = true;
            const action = updateTranslating(translating);
            expect(reduce(action)).toEqual(translating);
        });
    });

    describe('fetchingFlow reducer', () => {
        const reduce = action => fetchingFlowReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.editorUI.fetchingFlow);
        });

        it('should handle UPDATE_FETCHING_FLOW', () => {
            const fetchingFlow = true;
            const action = updateFetchingFlow(fetchingFlow);
            expect(reduce(action)).toEqual(fetchingFlow);
        });
    });

    describe('flows reducer', () => {
        const reduce = action => flowsReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.editorUI.flows);
        });

        it('should handle UPDATE_FLOWS', () => {
            const { response: flows } = flowsResp;
            const action = updateFlows(flows);
            expect(reduce(action)).toEqual(flows);
        });
    });

    describe('nodeEditorOpen reducer', () => {
        const reduce = action => nodeEditorOpenReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.editorUI.nodeEditorOpen);
        });

        it('should handle UPDATE_NODE_EDITOR_OPEN', () => {
            const nodeEditorOpen = true;
            const action = updateNodeEditorOpen(nodeEditorOpen);
            expect(reduce(action)).toEqual(nodeEditorOpen);
        });
    });

    describe('createNodePosition reducer', () => {
        const reduce = action => createNodePositionReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.flowUI.createNodePosition);
        });

        it('should handle UPDATE_CREATE_NODE_POSITION', () => {
            const createNodePosition = { left: 100, top: 250 };
            const action = updateCreateNodePosition(createNodePosition);
            expect(reduce(action)).toEqual(createNodePosition);
        });
    });

    describe('pendingConnection reducer', () => {
        const reduce = action => pendingConnectionReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.flowUI.pendingConnection);
        });

        it('should handle UPDATE_PENDING_CONNECTION', () => {
            const pendingConnection = {
                nodeUUID: generateUUID(),
                exitUUID: generateUUID()
            };
            const action = updatePendingConnection(pendingConnection);
            expect(reduce(action)).toEqual(pendingConnection);
        });
    });

    describe('pendingConnections reducer', () => {
        const reduce = action => pendingConnectionsReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.flowUI.pendingConnections);
        });

        it('should handle UPDATE_PENDING_CONNECTIONS', () => {
            const draggedTo = generateUUID();
            const draggedFrom = {
                nodeUUID: generateUUID(),
                exitUUID: generateUUID()
            };
            const action = updatePendingConnections(draggedTo, draggedFrom);
            expect(reduce(action)).toEqual({
                ...initialState.flowUI.pendingConnections,
                [draggedTo]: draggedFrom
            });
        });

        it('should handle REMOVE_PENDING_CONNECTION', () => {
            const draggedTo = generateUUID();
            const draggedFrom = {
                nodeUUID: generateUUID(),
                exitUUID: generateUUID()
            };
            const state = {
                ...initialState.flowUI.pendingConnections,
                [draggedTo]: draggedFrom
            };
            const action = removePendingConnection(draggedTo);
            expect(pendingConnectionsReducer(state, action)).toEqual({});
        });
    });

    describe('nodeDragging reducer', () => {
        const reduce = action => nodeDraggingReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.flowUI.nodeDragging);
        });

        it('should handle UPDATE_NODE_DRAGGING', () => {
            const nodeDragging = true;
            const action = updateNodeDragging(nodeDragging);
            expect(reduce(action)).toEqual(nodeDragging);
        });
    });

    describe('ghostNode reducer', () => {
        const reduce = action => ghostNodeReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.flowUI.ghostNode);
        });

        it('should handle UPDATE_GHOST_NODE', () => {
            const { definition } = colorsFlow.results[0];
            const fromNode: RenderNode = {
                node: definition.nodes[0],
                ui: definition._ui.nodes[definition.nodes[0].uuid],
                inboundConnections: {}
            };
            const ghostNode = getGhostNode(fromNode, { [fromNode.node.uuid]: fromNode });
            const action = updateGhostNode(ghostNode);
            expect(reduce(action)).toEqual(ghostNode);
        });
    });

    describe('dragGroup reducer', () => {
        const reduce = action => dragGroupReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.flowUI.dragGroup);
        });

        it('should handle UPDATE_DRAG_GROUP', () => {
            const dragGroup = true;
            const action = updateDragGroup(dragGroup);
            expect(reduce(action)).toEqual(dragGroup);
        });
    });
});
