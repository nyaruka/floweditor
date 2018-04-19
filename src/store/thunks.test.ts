jest.unmock('redux-mock-store');
jest.unmock('immutability-helper');

const createMockStore = require('redux-mock-store');
const mutate = require('immutability-helper');

import thunk from 'redux-thunk';
import * as types from './actionTypes';
import {
    FlowDefinition,
    SendMsg,
    AnyAction,
    FlowNode,
    SwitchRouter,
    Languages,
    FlowEditorConfig
} from '../flowTypes';
import {
    initializeFlow,
    removeNode,
    addNode,
    onUpdateAction,
    onUpdateLocalizations,
    updateDimensions,
    disconnectExit,
    updateConnection,
    ensureStartNode,
    moveActionUp,
    removeAction,
    spliceInRouter,
    reflow,
    updateExitDestination,
    resetNodeEditingState,
    onAddToNode,
    onNodeEditorClose,
    onNodeMoved,
    onConnectionDrag,
    onOpenNodeEditor,
    onUpdateRouter,
    fetchFlow,
    fetchFlows,
    updateSticky,
    onResetDragSelection,
    onAddContactField,
    onAddGroups
} from './thunks';
import { dump } from '../utils';
import { getUniqueDestinations, getFlowComponents, FlowComponents } from './helpers';
import { RenderNode, RenderNodeMap } from './flowContext';
import { v4 as generateUUID } from 'uuid';
import { Constants, LocalizationUpdates } from '.';
import { DragPoint } from '../component/Node';
import { NOT_FOUND } from '../component/actions/ChangeGroups/RemoveGroupsForm';
import { empty } from '../component/form/CaseElement.scss';
import { Types } from '../config/typeConfigs';
import { Operators } from '../config/operatorConfigs';
import { push } from '../utils';
import * as matchers from '../testUtils/matchers';

const getUpdatedNodes = (currentStore): { [uuid: string]: RenderNode } => {
    let nodes;
    // return the last action for UPDATE_NODES
    for (const action of currentStore.getActions()) {
        if (action.type === Constants.UPDATE_NODES) {
            nodes = action.payload.nodes;
        }
    }
    return nodes;
};

describe('fetch flows', () => {
    const store = createMockStore([thunk])({});
});

describe('Flow Manipulation', () => {
    const boring: FlowDefinition = require('../../__test__/flows/boring.json');
    const testNodes = getFlowComponents(boring).renderNodeMap;
    let store;

    beforeEach(() => {
        // prep our store to show that we are editing
        store = createMockStore([thunk])({
            flowContext: { definition: boring, nodes: testNodes, groups: [], contactFields: [] },
            flowEditor: { flowUI: {} },
            nodeEditor: { actionToEdit: null, nodeToEdit: null }
        });
    });

    describe('init', () => {
        it('should fetch and initalize flow', () => {
            return store
                .dispatch(fetchFlow('/assets/flows.json', 'boring'))
                .then((components: FlowComponents) => {
                    expect(Object.keys(components.renderNodeMap).length).toBe(4);
                });
        });

        it('should fetch and update the flow list', () => {
            store.dispatch(fetchFlows('/assets/flows.json')).then(action => {
                expect(action.type).toBe(Constants.UPDATE_FLOWS);
            });
        });

        it('should initialize definition', () => {
            const { renderNodeMap, groups, fields } = store.dispatch(initializeFlow(boring));
            expect(renderNodeMap).toMatchSnapshot('nodes');
            expect(store).toHaveReduxAction(Constants.UPDATE_NODES);

            expect(store).toHavePayload(Constants.UPDATE_GROUPS, {
                groups: [
                    {
                        name: 'Flow Participants',
                        id: 'group_0',
                        type: 'group'
                    },
                    {
                        name: 'Nonresponsive',
                        id: 'group_1',
                        type: 'group'
                    }
                ]
            });

            expect(store).toHavePayload(Constants.UPDATE_CONTACT_FIELDS, {
                contactFields: [
                    {
                        name: 'Unknown Field',
                        id: 'unknown_field',
                        type: 'field'
                    }
                ]
            });
        });

        it('should update localizations', () => {
            const updatedStore = createMockStore([thunk])({
                flowContext: { definition: boring }
            });
            const localizationUpdates: LocalizationUpdates = [
                {
                    uuid: 'node0_action0',
                    translations: { text: ['espanols'] }
                }
            ];

            const updated: FlowDefinition = updatedStore.dispatch(
                onUpdateLocalizations('spa', localizationUpdates)
            );

            expect(updated.localization.spa.node0_action0).toEqual({ text: ['espanols'] });
        });
    });

    describe('stickies', () => {
        it('should add new stickies', () => {
            const newSticky = {
                title: 'Sticky A',
                body: 'The body for sticky A',
                position: { left: 100, top: 100 }
            };

            store.dispatch(updateSticky('stickyA', newSticky));

            // should see our new sticky note
            boring._ui.stickies = { stickyA: newSticky };

            expect(store).toHavePayload(Constants.UPDATE_DEFINITION, { definition: boring });
        });

        it('should add stickies to definitions with none', () => {
            delete boring._ui.stickies;
            store = createMockStore([thunk])({
                flowContext: { definition: boring }
            });

            const newSticky = {
                title: 'sticky0',
                body: 'The body for sticky0',
                position: { left: 100, top: 100 }
            };

            store.dispatch(updateSticky('sticky0', newSticky));

            // should see our new sticky note
            boring._ui.stickies = { sticky0: newSticky };
            expect(store).toHavePayload(Constants.UPDATE_DEFINITION, { definition: boring });
        });

        it('should remove stickies if null is passed', () => {
            boring._ui.stickies = {
                sticky0: {
                    title: 'sticky0',
                    body: 'The body for sticky0',
                    position: { left: 100, top: 100 }
                }
            };

            store = createMockStore([thunk])({
                flowContext: { definition: boring }
            });

            store.dispatch(updateSticky('sticky0', null));

            // should be back to an empty flow
            boring._ui.stickies = {};
            expect(store).toHavePayload(Constants.UPDATE_DEFINITION, { definition: boring });
        });
    });

    describe('nodes', () => {
        it('should reflow nodes', () => {
            // make our nodes collide
            const collidingNodes = mutate(testNodes, {
                node1: {
                    ui: { position: { $merge: { top: testNodes.node1.ui.position.top - 50 } } }
                }
            });

            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                flowContext: {
                    nodes: collidingNodes
                }
            });

            // forcing a reflow should bump us down where we don't collide
            const updated = updatedStore.dispatch(reflow());
            expect(updated.node1.ui.position.top).toBe(260);
        });

        it('should cascade reflow', () => {
            // make our nodes have a cascading collision
            const collidingNodes = mutate(testNodes, {
                node1: {
                    ui: { position: { $merge: { top: testNodes.node1.ui.position.top - 50 } } }
                },
                node2: {
                    ui: { position: { $merge: { top: testNodes.node2.ui.position.top - 50 } } }
                }
            });

            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                flowContext: {
                    nodes: collidingNodes
                }
            });

            // forcing a reflow should bump us down where we don't collide
            const updated = updatedStore.dispatch(reflow());
            expect(updated.node1.ui.position.top).toBe(260);

            // and we should have cascaded to the third node
            expect(updated.node2.ui.position.top).toBe(420);
            expect(updatedStore.getActions().length).toBe(1);
        });

        it('should move nodes', () => {
            const nodes = store.dispatch(
                onNodeMoved(testNodes.node0.node.uuid, { left: 500, top: 600 })
            );

            expect(nodes.node0.ui.position).toEqual({
                left: 500,
                top: 600,
                right: 720,
                bottom: 854
            });
        });

        it('should clear the drag selection when a node is moved', () => {
            // prep our store to show that we are editing
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes },
                flowEditor: { flowUI: { dragSelection: { selected: { nodeA: true } } } },
                nodeEditor: { actionToEdit: null, nodeToEdit: null }
            });

            store.dispatch(onNodeMoved(testNodes.node0.node.uuid, { left: 500, top: 600 }));
            expect(store).toHavePayload(Constants.UPDATE_DRAG_SELECTION, {
                dragSelection: {
                    selected: null
                }
            });
        });

        it('should clear drag selection', () => {
            // prep our store to show that we are editing
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes },
                flowEditor: { flowUI: { dragSelection: { selected: { nodeA: true } } } },
                nodeEditor: { actionToEdit: null, nodeToEdit: null }
            });

            store.dispatch(onResetDragSelection());
            expect(store).toHavePayload(Constants.UPDATE_DRAG_SELECTION, {
                dragSelection: {
                    selected: null
                }
            });
        });

        it('should store a pending connection when starting a drag', () => {
            store.dispatch(
                onConnectionDrag({
                    connection: null,
                    endpoints: null,
                    suspendedElementId: null,
                    target: null,
                    targetId: null,
                    source: null,
                    sourceId: 'node0:node0_exit0'
                })
            );
            expect(store).toHaveReduxAction(Constants.UPDATE_GHOST_NODE);
            expect(store).toHavePayload(Constants.UPDATE_PENDING_CONNECTION, {
                pendingConnection: {
                    nodeUUID: 'node0',
                    exitUUID: 'node0_exit0'
                }
            });
        });

        it('should update dimensions', () => {
            const updated = store.dispatch(
                updateDimensions(testNodes.node0.node, { width: 300, height: 600 })
            );

            expect(updated.node0.ui.position).toEqual({
                left: 0,
                top: 0,
                right: 300,
                bottom: 600
            });
        });

        it('should create a start node if needed', () => {
            // if there are already nodes, we're a noop
            expect(store.dispatch(ensureStartNode())).toBeUndefined();

            // create a store without nodes
            const updatedStore = createMockStore([thunk])({
                flowContext: { nodes: {} }
            });

            // now we create a new one
            const newNode = updatedStore.dispatch(ensureStartNode());
            expect(newNode.node.actions[0].text).toBe(
                'Hi there, this is the first message in your flow.'
            );
        });

        describe('removal', () => {
            it('should remove it from the map', () => {
                const nodes = store.dispatch(removeNode(testNodes.node1.node));
                expect(nodes.node1).toBeUndefined();
            });

            it('should remove pointers from its destination', () => {
                const nodes = store.dispatch(removeNode(testNodes.node0.node));
                const destinations = getUniqueDestinations(testNodes.node0.node);
                expect(destinations.length).toBe(1);

                // we were the only thing pointing to our friends, so now they
                // should have no inbound connections
                for (const nodeUUID of destinations) {
                    expect(nodes[nodeUUID]).not.toHaveInboundConnections();
                }
            });

            it('should reroute pass through connections', () => {
                const nodes = store.dispatch(removeNode(testNodes.node2.node));

                // we reomved 2, so now 1 should point to 3
                expect(nodes.node1).toHaveExitThatPointsTo(nodes.node3);

                // and the next node in the tree should reflect our inbound connection
                expect(nodes.node3).toHaveInboundFrom(testNodes.node1.node.exits[0]);
            });

            // test a snapshot after removing each node in the flow
            for (const nodeUUID of Object.keys(testNodes)) {
                it('should remove node ' + nodeUUID, () => {
                    const nodes = store.dispatch(removeNode(testNodes[nodeUUID].node));
                    expect(nodes).toMatchSnapshot('Remove ' + nodeUUID);
                });
            }
        });
    });

    describe('connections', () => {
        it('should updateExitDestination()', () => {
            const updated = store.dispatch(updateExitDestination('node0', 'node0_exit0', 'node2'));
            expect(updated.node0).toHaveExitThatPointsTo(updated.node2);
        });

        it('should disconnectExit()', () => {
            const updated = store.dispatch(disconnectExit('node0', 'node0_exit0'));
            expect(updated.node0).not.toHaveExitWithDestination();
        });

        it('should updateConnection()', () => {
            const updated = store.dispatch(updateConnection('node0:node0_exit0', 'node2'));
            expect(updated.node0).toHaveExitThatPointsTo(updated.node2);
        });

        it('should throw if attempting to connect node to itself', () => {
            expect(() => {
                store.dispatch(updateConnection('node0:node0_exit0', 'node0'));
            }).toThrowError('Cannot connect node0 to itself');
        });

        it('should update connections when adding a node', () => {
            let fromNode = testNodes.node3;
            const fromNodeUUID = fromNode.node.uuid;
            const fromExitUUID = fromNode.node.exits[0].uuid;

            const addedNode = store.dispatch(
                addNode({
                    node: { uuid: null, actions: [], exits: [] },
                    ui: { position: { left: 200, top: 200 } },
                    inboundConnections: {
                        [fromExitUUID]: fromNodeUUID
                    }
                })
            );

            const nodes = getUpdatedNodes(store);
            fromNode = nodes[fromNodeUUID];

            // our pointing node should be directed at us
            expect(fromNode).toHaveExitThatPointsTo(addedNode);
            expect(addedNode).toHaveInboundFrom(fromNode.node.exits[0]);
        });
    });

    it('should add new contact fields', () => {
        store.dispatch(onAddContactField('A new field'));

        // we should get a snakified and titled field
        expect(store).toHavePayload(Constants.UPDATE_CONTACT_FIELDS, {
            contactFields: [
                {
                    id: 'a_new_field',
                    name: 'A New Field',
                    type: 'field'
                }
            ]
        });
    });

    it('should add new groups', () => {
        store.dispatch(onAddGroups([{ name: 'My new group', id: 'my_new_group' }]));
        expect(store).toHavePayload(Constants.UPDATE_GROUPS, {
            groups: [
                {
                    name: 'My new group',
                    id: 'my_new_group'
                }
            ]
        });
    });

    describe('actions', () => {
        it('should add new action', () => {
            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                ...store.getState(),
                nodeEditor: { userAddingAction: true, nodeToEdit: testNodes.node0.node }
            });

            // add a new message to the first node
            const nodes = updatedStore.dispatch(
                onUpdateAction({
                    uuid: 'new_action',
                    type: Types.send_msg,
                    text: 'A fourth action for our first node'
                })
            );

            // we should have a new action
            const actions = nodes.node0.node.actions;
            expect(actions.length).toBe(4);
            expect((actions[3] as SendMsg).text).toBe('A fourth action for our first node');
        });

        it('should throw if nodeToEdit is null', () => {
            expect(() => {
                // add a new message to the first node
                const nodes = store.dispatch(
                    onUpdateAction({
                        uuid: 'new_action',
                        type: Types.send_msg,
                        text: 'A second message for our first node'
                    })
                );
            }).toThrowError('Need nodeToEdit in state to update an action');
        });

        it('should update an existing action', () => {
            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                ...store.getState(),
                nodeEditor: { userAddingAction: false, nodeToEdit: testNodes.node0.node }
            });

            // add a new message to the first node
            const nodes = updatedStore.dispatch(
                onUpdateAction({
                    uuid: 'node0_action0',
                    type: 'send_msg',
                    text: 'An updated message'
                })
            );

            expect(nodes.node0.node.actions[0].text).toBe('An updated message');
        });

        it('should remove the node when removing the last action', () => {
            // remove the first action
            const updated = store.dispatch(removeAction('node3', testNodes.node3.node.actions[0]));

            // first one was removed, so now actionB is first
            expect(updated.node3).toBeUndefined();
        });

        it('should remove an action from a list of actions', () => {
            // remove the first action
            const updated = store.dispatch(removeAction('node0', testNodes.node0.node.actions[0]));

            // first one was removed, so now second action is first
            expect(updated.node0.node.actions[0].uuid).toBe('node0_action1');
        });

        it('should move an action up', () => {
            // add a second action so we can test single action removal
            const updated = store.dispatch(moveActionUp('node0', testNodes.node0.node.actions[1]));
            expect(updated.node0.node.actions[0].uuid).toBe('node0_action1');
        });

        it('should create a new node if needed for new action', () => {
            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                ...store.getState(),

                flowEditor: {
                    flowUI: {
                        pendingConnection: { exitUUID: 'node3_exit0', nodeUUID: 'node3' },
                        createNodePosition: { left: 500, top: 500 }
                    }
                },
                nodeEditor: {
                    userAddingAction: true,
                    nodeToEdit: {}
                }
            });

            const newAction = {
                uuid: 'new_action_for_new_node',
                type: Types.send_msg,
                text: 'An action for a new node'
            } as SendMsg;

            const updated = updatedStore.dispatch(onUpdateAction(newAction));
            const newNodeUUID = updated.node3.node.exits[0].destination_node_uuid;
            expect(newNodeUUID).not.toBeUndefined();

            const newNode = updated[newNodeUUID];
            expect(newNode.ui.position).toEqual({ left: 500, top: 500 });
            expect(newNode.inboundConnections.node3_exit0).toBe('node3');
            expect(newNode.node.actions[0].uuid).toBe('new_action_for_new_node');
        });

        describe('splicing', () => {
            const addRouter = (
                currentStore: any,
                renderNode: RenderNode,
                action: AnyAction
            ): RenderNodeMap => {
                const newExitUUID = generateUUID();
                const newNode: RenderNode = {
                    node: {
                        actions: [],
                        router: {
                            type: 'switch',
                            cases: [],
                            default_exit_uuid: newExitUUID
                        } as SwitchRouter,
                        uuid: generateUUID(),
                        exits: [
                            {
                                uuid: newExitUUID,
                                destination_node_uuid: null
                            }
                        ]
                    },
                    ui: {
                        position: { left: 100, top: 100 },
                        type: Types.wait_for_response
                    },
                    inboundConnections: {}
                };

                const previousAction = { nodeUUID: renderNode.node.uuid, actionUUID: action.uuid };
                return currentStore.dispatch(spliceInRouter(newNode, previousAction));
            };

            it('should replace the first action of two', () => {
                const nodes = addRouter(store, testNodes.node2, testNodes.node2.node.actions[0]);
                const topNode = nodes[nodes.node1.node.exits[0].destination_node_uuid];
                const bottomNode = nodes[topNode.node.exits[0].destination_node_uuid];

                // top node should point to the middle node, and middle should point back
                expect(topNode.inboundConnections).toEqual(testNodes.node2.inboundConnections);

                // bottom node should point back to top node
                expect(bottomNode).toHaveInboundFrom(topNode.node.exits[0]);

                // bottom node should point to the same place as original node
                expect(bottomNode).toHaveExitThatPointsTo(nodes.node3);

                // original node should be gonezor
                expect(nodes[testNodes.node2.node.uuid]).toBeUndefined();
            });

            it('should replace the second action of two', () => {
                const nodes = addRouter(store, testNodes.node2, testNodes.node2.node.actions[1]);
                const topNode = nodes[nodes.node1.node.exits[0].destination_node_uuid];
                const bottomNode = nodes[topNode.node.exits[0].destination_node_uuid];

                expect(topNode.node.exits[0]).toPointTo(bottomNode);
                expect(bottomNode).toHaveInboundFrom(topNode.node.exits[0]);
            });

            it('should replace the second action of three', () => {
                const nodes = addRouter(store, testNodes.node0, testNodes.node0.node.actions[1]);

                // find our top node by position since it's uuid will be different
                const topNodeUUID = Object.keys(nodes).find((key: string) => {
                    return nodes[key].ui.position.top === 0;
                });

                const topNode = nodes[topNodeUUID];
                const middleNode = nodes[topNode.node.exits[0].destination_node_uuid];
                const bottomNode = nodes[middleNode.node.exits[0].destination_node_uuid];

                // top node should point to the middle node, and middle should point back
                expect(middleNode).toHaveInboundFrom(topNode.node.exits[0]);

                // middle should point to the bottom, and bottom should point back
                expect(bottomNode).toHaveInboundFrom(middleNode.node.exits[0]);

                // original node should be gonezor
                expect(nodes.node0).toBeUndefined();
            });
        });
    });

    describe('node editor', () => {
        const languages: Languages = {
            eng: 'English',
            spa: 'Spanish'
        };

        beforeEach(() => {
            // now try a store with all the things set
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes, definition: { localization: {} } },
                flowEditor: { editorUI: {}, flowUI: {} },
                nodeEditor: {}
            });
        });

        describe('translation', () => {
            it('should edit in translation mode', () => {
                store = createMockStore([thunk])({
                    flowContext: { nodes: testNodes, definition: { localization: {} } },
                    flowEditor: {
                        editorUI: { language: { iso: 'spa' }, translating: true },
                        flowUI: {}
                    },
                    nodeEditor: {}
                });

                store.dispatch(
                    onOpenNodeEditor(
                        testNodes.node0.node,
                        testNodes.node0.node.actions[0],
                        languages
                    )
                );

                expect(store).toHaveReduxAction(Constants.UPDATE_LOCALIZATIONS);
            });

            it('should pick your action for you if necessary', () => {
                store = createMockStore([thunk])({
                    flowContext: { nodes: testNodes, definition: { localization: {} } },
                    flowEditor: {
                        editorUI: { language: { iso: 'spa' }, translating: true },
                        flowUI: {}
                    },
                    nodeEditor: {}
                });

                store.dispatch(onOpenNodeEditor(testNodes.node3.node, null, languages));
                expect(store).toHaveReduxAction(Constants.UPDATE_LOCALIZATIONS);
            });

            it('should only pick send_msg actions for you when translating', () => {
                store = createMockStore([thunk])({
                    flowContext: { nodes: testNodes, definition: { localization: {} } },
                    flowEditor: {
                        editorUI: { language: { iso: 'spa' }, translating: true },
                        flowUI: {}
                    },
                    nodeEditor: {}
                });

                store.dispatch(onOpenNodeEditor(testNodes.node2.node, null, languages));
                expect(store).not.toHaveReduxAction(Constants.UPDATE_LOCALIZATIONS);
            });
        });

        describe('normal editing', () => {
            it('should edit an existing action', () => {
                store.dispatch(
                    onOpenNodeEditor(
                        testNodes.node0.node,
                        testNodes.node0.node.actions[0],
                        languages
                    )
                );

                expect(store).toHavePayload(Constants.UPDATE_ACTION_TO_EDIT, {
                    actionToEdit: testNodes.node0.node.actions[0]
                });
            });

            it('should pick the last action if none are provided', () => {
                store.dispatch(onOpenNodeEditor(testNodes.node3.node, null, languages));

                expect(store).toHavePayload(Constants.UPDATE_ACTION_TO_EDIT, {
                    actionToEdit: testNodes.node3.node.actions[0]
                });
            });

            it('should throw if no action is provided on an actionless node', () => {
                testNodes.node0.node.actions = [];
                expect(() => {
                    store.dispatch(onOpenNodeEditor(testNodes.node0.node, null, languages));
                }).toThrowError('Cannot initialize NodeEditor without a valid type: node0');
            });

            it('should edit router nodes', () => {
                store.dispatch(onOpenNodeEditor(testNodes.node1.node, null, languages));

                expect(store).toHavePayload(Constants.UPDATE_TYPE_CONFIG, {
                    typeConfig: {
                        type: Types.wait_for_response,
                        name: 'Wait for Response',
                        description: 'Wait for them to respond',
                        advanced: 2,
                        aliases: ['switch']
                    }
                });

                expect(store).toHavePayload(Constants.UPDATE_NODE_TO_EDIT, {
                    nodeToEdit: testNodes.node1.node
                });

                expect(store).toHavePayload(Constants.UPDATE_NODE_EDITOR_OPEN, {
                    nodeEditorOpen: true
                });
            });
        });

        describe('opening and closing', () => {
            it('should open the editor in add to node mode', () => {
                store.dispatch(onAddToNode(testNodes.node0.node));

                expect(store).toHavePayload(Constants.UPDATE_USER_ADDING_ACTION, {
                    userAddingAction: true
                });

                expect(store).toHavePayload(Constants.UPDATE_NODE_TO_EDIT, {
                    nodeToEdit: testNodes.node0.node
                });
            });

            it('should clear things when the editor is canceled', () => {
                store.dispatch(onNodeEditorClose(false, null));
                expect(store).toHavePayload(Constants.UPDATE_GHOST_NODE, {
                    ghostNode: null
                });
            });

            it('should clear things when the editor is closed', () => {
                store.dispatch(onNodeEditorClose(true, null));
                expect(store).toHavePayload(Constants.UPDATE_GHOST_NODE, {
                    ghostNode: null
                });
            });

            it('should rewire the old connection when canceling the editor', () => {
                store = createMockStore([thunk])({
                    flowContext: { nodes: testNodes },
                    flowEditor: {
                        flowUI: {
                            pendingConnection: {
                                exitUUID: testNodes.node0.node.exits[0].uuid,
                                nodeUUID: testNodes.node0.node.uuid
                            } as DragPoint,
                            createNodePosition: {}
                        }
                    },
                    nodeEditor: { actionToEdit: {}, nodeToEdit: {} }
                });

                const connectExit = jest.fn();
                store.dispatch(onNodeEditorClose(true, connectExit));
                expect(connectExit).toHaveBeenCalled();
            });

            it('should only update things that are set', () => {
                store.dispatch(resetNodeEditingState());

                expect(store).toHavePayload(Constants.UPDATE_GHOST_NODE, {
                    ghostNode: null
                });

                expect(store.getActions().length).toBe(1);
            });

            it('should reset the node editor', () => {
                // now try a store with all the things set
                store = createMockStore([thunk])({
                    flowContext: { nodes: testNodes },
                    flowEditor: { flowUI: { pendingConnection: {}, createNodePosition: {} } },
                    nodeEditor: { actionToEdit: {}, nodeToEdit: {} }
                });

                store.dispatch(resetNodeEditingState());

                expect(store).toHavePayload(Constants.UPDATE_GHOST_NODE, {
                    ghostNode: null
                });

                expect(store).toHavePayload(Constants.UPDATE_PENDING_CONNECTION, {
                    pendingConnection: null
                });

                expect(store).toHavePayload(Constants.UPDATE_CREATE_NODE_POSITION, {
                    createNodePosition: null
                });

                expect(store).toHavePayload(Constants.UPDATE_NODE_TO_EDIT, {
                    nodeToEdit: null
                });

                expect(store).toHavePayload(Constants.UPDATE_ACTION_TO_EDIT, {
                    actionToEdit: null
                });
            });
        });
    });

    describe('routers', () => {
        it('should edit an existing router', () => {
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes },
                flowEditor: { flowUI: {} },
                nodeEditor: { nodeToEdit: testNodes.node1.node }
            });

            const updatedNode = mutate(testNodes.node1, {
                node: {
                    router: {
                        cases: push([
                            {
                                uuid: 'new_case',
                                type: Operators.has_any_word,
                                exit_uuid: 'exitD',
                                arguments: ['anotherrule']
                            }
                        ])
                    }
                }
            });

            const previousTop = testNodes.node1.ui.position.top;

            const nodes = store.dispatch(onUpdateRouter(updatedNode));
            const newCase = nodes.node1.node.router.cases[2];
            expect(newCase.arguments).toEqual(['anotherrule']);
            expect(nodes.node1.ui.position.top).toBe(previousTop);
        });

        it('should create a new router on drag', () => {
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes },
                flowEditor: {
                    flowUI: {
                        createNodePosition: { left: 500, top: 600 },
                        pendingConnection: { nodeUUID: 'node2', exitUUID: 'node2_exit0' }
                    }
                },
                nodeEditor: { nodeToEdit: testNodes.node3.node }
            });

            const newRouter: RenderNode = {
                node: { uuid: 'new_router', actions: [], exits: [] },
                ui: { position: null },
                inboundConnections: {}
            };

            // add our router
            const nodes = store.dispatch(onUpdateRouter(newRouter));

            // make sure things are wired up as expected
            const newNode = nodes[nodes.node2.node.exits[0].destination_node_uuid];
            expect(newNode).toHaveInboundFrom(nodes.node2.node.exits[0]);
            expect(nodes.node2.node.exits[0]).toPointTo(newNode);
            expect(newNode.ui.position).toEqual({ left: 500, top: 600 });
        });

        it('should update an action into a router', () => {
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes },
                flowEditor: { flowUI: {} },
                nodeEditor: {
                    actionToEdit: testNodes.node3.node.actions[0],
                    nodeToEdit: testNodes.node3.node
                }
            });

            const newRouter: RenderNode = {
                node: {
                    uuid: 'new_router',
                    actions: [],
                    exits: [{ uuid: 'new_exit', destination_node_uuid: null }]
                },
                ui: { position: null },
                inboundConnections: {}
            };

            // splice in our new router
            const nodes = store.dispatch(onUpdateRouter(newRouter));

            // old node should be gone
            expect(nodes.node3).toBeUndefined();
        });

        it('should append a router after an add action', () => {
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes },
                flowEditor: { flowUI: {} },
                nodeEditor: {
                    actionToEdit: {},
                    nodeToEdit: testNodes.node0.node
                }
            });

            const newRouter: RenderNode = {
                node: {
                    uuid: 'new_router',
                    actions: [],
                    router: {
                        default_exit_uuid: 'new_exit'
                    } as SwitchRouter,
                    exits: [{ uuid: 'new_exit', destination_node_uuid: null }]
                },
                ui: { position: null },
                inboundConnections: {}
            };

            const previousBottom = testNodes.node0.ui.position.bottom;

            // splice in our new router
            const nodes = store.dispatch(onUpdateRouter(newRouter));
            const newNodeUUID = nodes.node0.node.exits[0].destination_node_uuid;
            expect(nodes[newNodeUUID]).toHaveInboundFrom(nodes.node0.node.exits[0]);

            // our top should start at the bottom of the previous node
            expect(nodes[newNodeUUID].ui.position.top).toBe(previousBottom);
        });
    });
});
