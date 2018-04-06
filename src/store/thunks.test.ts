jest.unmock('redux-mock-store');
jest.unmock('immutability-helper');
import '../testUtils/matchers';

// import {createMockStore} from 'redux-mock-store';
const createMockStore = require('redux-mock-store');
import thunk from 'redux-thunk';
import * as types from './actionTypes';
import { FlowDefinition, SendMsg, AnyAction, FlowNode, SwitchRouter } from '../flowTypes';
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
    resetNodeEditingState
} from './thunks';
import { dump } from '../utils';
import { getUniqueDestinations } from './helpers';
import { RenderNode, RenderNodeMap } from './flowContext';
import { v4 as generateUUID } from 'uuid';
import { Constants, LocalizationUpdates, onAddToNode } from '.';
import { NODES_ABC } from './__test__';

const getUpdatedNodes = (currentStore = null): { [uuid: string]: RenderNode } => {
    let nodes;

    // return the last action for UPDATE_NODES
    for (const action of currentStore.getActions()) {
        if (action.type === Constants.UPDATE_NODES) {
            nodes = action.payload.nodes;
        }
    }
    return nodes;
};

describe('Color Flow', () => {
    let colorsFlow: FlowDefinition;
    let store;

    beforeEach(() => {
        store = createMockStore([thunk])({});
        colorsFlow = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json')
            .results[0].definition as FlowDefinition;
    });

    it('should initalize definition', () => {
        const nodes = store.dispatch(initializeFlow(colorsFlow));
        expect(nodes).toMatchSnapshot();
    });

    it('should update localizations', () => {
        const updatedStore = createMockStore([thunk])({
            flowContext: { definition: colorsFlow }
        });
        const actionUUID = colorsFlow.nodes[0].actions[0].uuid;
        const localizationUpdates: LocalizationUpdates = [
            {
                uuid: actionUUID,
                translations: { text: ['espanols'] }
            }
        ];

        const updated: FlowDefinition = updatedStore.dispatch(
            onUpdateLocalizations('spa', localizationUpdates)
        );

        expect(updated.localization.spa[actionUUID]).toEqual({ text: ['espanols'] });
    });
});

describe('ABC RenderNodeMap', () => {
    const testNodes = NODES_ABC;
    let store;

    const cloneNodes = () => {
        // quick and dirty deep copy
        return JSON.parse(JSON.stringify(testNodes));
    };

    beforeEach(() => {
        // prep our store to show that we are editing
        store = createMockStore([thunk])({
            flowContext: { nodes: testNodes },
            flowEditor: { flowUI: {} },
            nodeEditor: { actionToEdit: null, nodeToEdit: null }
        });
    });

    describe('nodes', () => {
        // describe('addNode', () => {});

        it('should reflow nodes', () => {
            // we are starting at 150 which overlaps with nodeA
            expect(testNodes.nodeB.ui.position.top).toBe(150);

            // forcing a reflow should bump us down where we don't collide
            let updated = store.dispatch(reflow());
            expect(updated.nodeB.ui.position.top).toBe(200);
            expect(updated.nodeC.ui.position.top).toBe(360);
            expect(store.getActions().length).toBe(1);

            // cascading should create two update actions
            testNodes.nodeC.ui.position.top = 210;
            updated = store.dispatch(reflow());
            expect(updated.nodeC.ui.position.top).toBe(360);
            expect(store.getActions().length).toBe(2);
        });

        it('should update dimensions', () => {
            const updated = store.dispatch(
                updateDimensions(testNodes.nodeA.node, { width: 300, height: 600 })
            );

            expect(updated.nodeA.ui.position).toEqual({
                left: 100,
                top: 100,
                right: 400,
                bottom: 700
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
                const nodes = store.dispatch(removeNode(testNodes.nodeB.node));
                expect(nodes.nodeB).toBeUndefined();
            });

            it('should remove pointers from its destination', () => {
                const nodes = store.dispatch(removeNode(testNodes.nodeA.node));
                const destinations = getUniqueDestinations(testNodes.nodeA.node);
                expect(destinations.length).toBe(1);

                // we were the only thing pointing to our friends, so now they
                // should have no inbound connections
                for (const nodeUUID of destinations) {
                    expect(nodes[nodeUUID]).not.toHaveInboundConnections();
                }
            });

            it('should reroute pass through connections', () => {
                const nodes = store.dispatch(removeNode(testNodes.nodeB.node));

                // we reomved B, so now A should point to C
                expect(nodes.nodeA).toHaveExitThatPointsTo(nodes.nodeC);

                // and the next node in the tree should reflect our inbound connection
                expect(nodes.nodeC).toHaveInboundFrom(testNodes.nodeA.node.exits[0]);
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
            const updated = store.dispatch(updateExitDestination('nodeA', 'exitA', 'nodeC'));
            expect(updated.nodeA).toHaveExitThatPointsTo(updated.nodeC);
        });

        it('should disconnectExit()', () => {
            const updated = store.dispatch(disconnectExit('nodeA', 'exitA'));
            expect(updated.nodeA).not.toHaveExitWithDestination();
        });

        it('should updateConnection()', () => {
            const updated = store.dispatch(updateConnection('nodeA:exitA', 'nodeC'));
            expect(updated.nodeA).toHaveExitThatPointsTo(updated.nodeC);
        });

        it('should throw if attempting to connect node to itself', () => {
            expect(() => {
                store.dispatch(updateConnection('nodeA:exitA', 'nodeA'));
            }).toThrowError('Cannot connect nodeA to itself');
        });

        it('should update update connections when adding a node', () => {
            let fromNode = testNodes.nodeB;
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

    describe('actions', () => {
        it('should add new action', () => {
            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                ...store.getState(),
                nodeEditor: { userAddingAction: true, nodeToEdit: testNodes.nodeA.node }
            });

            // add a new message to the first node
            const nodes = updatedStore.dispatch(
                onUpdateAction({
                    uuid: 'new_action',
                    type: 'send_msg',
                    text: 'A second message for our first node'
                })
            );

            // we should have a new action
            const actions = nodes.nodeA.node.actions;
            expect(actions.length).toBe(2);
            expect((actions[1] as SendMsg).text).toBe('A second message for our first node');
        });

        it('should throw if nodeToEdit is null', () => {
            expect(() => {
                // add a new message to the first node
                const nodes = store.dispatch(
                    onUpdateAction({
                        uuid: 'new_action',
                        type: 'send_msg',
                        text: 'A second message for our first node'
                    })
                );
            }).toThrowError('Need nodeToEdit in state to update an action');
        });

        it('should update an existing action', () => {
            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                ...store.getState(),
                nodeEditor: { userAddingAction: false, nodeToEdit: testNodes.nodeA.node }
            });

            // add a new message to the first node
            const nodes = updatedStore.dispatch(
                onUpdateAction({
                    uuid: 'actionA',
                    type: 'send_msg',
                    text: 'An updated message'
                })
            );

            expect(nodes.nodeA.node.actions[0].text).toBe('An updated message');
        });

        it('should remove the node when removing the last action', () => {
            // remove the first action
            const updated = store.dispatch(removeAction('nodeA', testNodes.nodeA.node.actions[0]));

            // first one was removed, so now actionB is first
            expect(updated.nodeA).toBeUndefined();
        });

        it('should remove an action from a list of actions', () => {
            // add a second action so we can test single action removal
            const updatedNodes = cloneNodes();
            updatedNodes.nodeA.node.actions.push({
                uuid: 'actionB',
                type: 'send_msg',
                text: 'A second message for our first node'
            } as SendMsg);

            const updatedStore = createMockStore([thunk])({
                flowContext: { nodes: updatedNodes }
            });

            // remove the first action
            const updated = updatedStore.dispatch(
                removeAction('nodeA', testNodes.nodeA.node.actions[0])
            );

            // first one was removed, so now actionB is first
            expect(updated.nodeA.node.actions[0].uuid).toBe('actionB');
        });

        it('should move an action up', () => {
            // add a second action so we can test single action removal
            const updatedNodes = cloneNodes();
            updatedNodes.nodeA.node.actions.push({
                uuid: 'actionB',
                type: 'send_msg',
                text: 'A second message for our first node'
            } as SendMsg);

            const updatedStore = createMockStore([thunk])({
                flowContext: { nodes: updatedNodes }
            });

            const updated = updatedStore.dispatch(
                moveActionUp('nodeA', updatedNodes.nodeA.node.actions[1])
            );
            expect(updated.nodeA.node.actions[0].uuid).toBe('actionB');
        });

        it('should create a new node if needed for new action', () => {
            // prep our store to show that we are editing
            const updatedStore = createMockStore([thunk])({
                ...store.getState(),

                flowEditor: {
                    flowUI: {
                        pendingConnection: { exitUUID: 'exitE', nodeUUID: 'nodeE' },
                        createNodePosition: { left: 500, top: 500 }
                    }
                },
                nodeEditor: {
                    userAddingAction: true,
                    nodeToEdit: testNodes.nodeA.node
                }
            });

            const newAction = {
                uuid: 'new_action_for_new_node',
                type: 'send_msg',
                text: 'An action for a new node'
            } as SendMsg;

            const updated = updatedStore.dispatch(onUpdateAction(newAction));
            const newNodeUUID = updated.nodeE.node.exits[0].destination_node_uuid;
            expect(newNodeUUID).not.toBeUndefined();

            const newNode = updated[newNodeUUID];
            expect(newNode.ui.position).toEqual({ left: 500, top: 500 });
            expect(newNode.inboundConnections.exitE).toBe('nodeE');
            expect(newNode.node.actions[0].uuid).toBe('new_action_for_new_node');
        });

        describe('splicing', () => {
            /**
             *
             * @param currentStore
             * @param renderNode
             */
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
                        type: 'wait_for_response'
                    },
                    inboundConnections: {}
                };

                const previousAction = { nodeUUID: renderNode.node.uuid, actionUUID: action.uuid };
                return currentStore.dispatch(spliceInRouter(newNode, previousAction));
            };

            it('should replace the first action of two', () => {
                const updatedNodes = cloneNodes();
                updatedNodes.nodeB.node.actions.push({
                    uuid: 'action1',
                    type: 'send_msg',
                    text: 'second node, message one'
                } as SendMsg);

                updatedNodes.nodeB.node.actions.push({
                    uuid: 'action2',
                    type: 'send_msg',
                    text: 'second node, message two'
                } as SendMsg);

                const updatedStore = createMockStore([thunk])({
                    flowContext: { nodes: updatedNodes }
                });

                const nodeB = updatedNodes.nodeB;
                const nodes = addRouter(updatedStore, nodeB, nodeB.node.actions[0]);

                const topNode = nodes[nodes.nodeA.node.exits[0].destination_node_uuid];
                const bottomNode = nodes[topNode.node.exits[0].destination_node_uuid];

                // top node should point to the middle node, and middle should point back
                expect(topNode.inboundConnections).toEqual(nodeB.inboundConnections);

                // bottom node should point back to top node
                expect(bottomNode).toHaveInboundFrom(topNode.node.exits[0]);

                // bottom node should point to the same place as original node
                expect(bottomNode).toHaveExitThatPointsTo(nodes.nodeC);

                // original node should be gonezor
                expect(nodes[updatedNodes.nodeB.node.uuid]).toBeUndefined();
            });

            it('should replace the second action of two', () => {
                const updatedNodes = cloneNodes();
                updatedNodes.nodeB.node.actions.push({
                    uuid: 'action1',
                    type: 'send_msg',
                    text: 'second node, message one'
                } as SendMsg);

                updatedNodes.nodeB.node.actions.push({
                    uuid: 'action2',
                    type: 'send_msg',
                    text: 'second node, message two'
                } as SendMsg);

                const updatedStore = createMockStore([thunk])({
                    flowContext: { nodes: updatedNodes }
                });

                const nodeB = updatedNodes.nodeB;
                const nodes = addRouter(updatedStore, nodeB, nodeB.node.actions[1]);
            });

            it('should replace the second action of three', () => {
                const updatedNodes = cloneNodes();
                updatedNodes.nodeB.node.actions = [
                    {
                        uuid: 'action1',
                        type: 'send_msg',
                        text: 'second node, message one'
                    } as SendMsg,
                    {
                        uuid: 'action2',
                        type: 'send_msg',
                        text: 'second node, message two'
                    } as SendMsg,
                    {
                        uuid: 'action3',
                        type: 'send_msg',
                        text: 'second node, message three'
                    } as SendMsg
                ];

                const updatedStore = createMockStore([thunk])({
                    flowContext: { nodes: updatedNodes }
                });

                const nodeB = updatedNodes.nodeB;
                const nodes = addRouter(updatedStore, nodeB, nodeB.node.actions[1]);

                const topNode = nodes[nodes.nodeA.node.exits[0].destination_node_uuid];
                const middleNode = nodes[topNode.node.exits[0].destination_node_uuid];
                const bottomNode = nodes[middleNode.node.exits[0].destination_node_uuid];

                // top node should point to the middle node, and middle should point back
                expect(middleNode).toHaveInboundFrom(topNode.node.exits[0]);

                // middle should point to the bottom, and bottom should point back
                expect(bottomNode).toHaveInboundFrom(middleNode.node.exits[0]);

                // original node should be gonezor
                expect(nodes[updatedNodes.nodeB.node.uuid]).toBeUndefined();
            });
        });
    });

    describe('node editor', () => {
        beforeEach(() => {
            // now try a store with all the things set
            store = createMockStore([thunk])({
                flowContext: { nodes: testNodes },
                flowEditor: { flowUI: {} },
                nodeEditor: {}
            });
        });

        it('should only update things that are set', () => {
            store.dispatch(resetNodeEditingState());

            expect(store).toHaveReduxActionWithPayload(Constants.UPDATE_GHOST_NODE, {
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

            expect(store).toHaveReduxActionWithPayload(Constants.UPDATE_GHOST_NODE, {
                ghostNode: null
            });

            expect(store).toHaveReduxActionWithPayload(Constants.UPDATE_PENDING_CONNECTION, {
                pendingConnection: null
            });

            expect(store).toHaveReduxActionWithPayload(Constants.UPDATE_CREATE_NODE_POSITION, {
                createNodePosition: null
            });

            expect(store).toHaveReduxActionWithPayload(Constants.UPDATE_NODE_TO_EDIT, {
                nodeToEdit: null
            });

            expect(store).toHaveReduxActionWithPayload(Constants.UPDATE_ACTION_TO_EDIT, {
                actionToEdit: null
            });
        });
    });

    describe('routers', () => {
        // console.log('routers');
    });
});
