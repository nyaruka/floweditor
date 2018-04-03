jest.unmock('redux-mock-store');
jest.unmock('immutability-helper');

// import {createMockStore} from 'redux-mock-store';
const createMockStore = require('redux-mock-store');
import thunk from 'redux-thunk';
import * as types from './actionTypes';
import { FlowDefinition, SendMsg, AnyAction, Node, SwitchRouter } from '../flowTypes';
import {
    initializeFlow,
    removeNode,
    addNode,
    updateAction,
    spliceInRouter,
    reflow
} from './thunks';
import { dump } from '../utils';
import { getUniqueDestinations } from './helpers';
import { RenderNode } from './flowContext';
import { v4 as generateUUID } from 'uuid';
import { Constants } from '.';
import { NODES_ABC } from './__test__';

describe('thunks', () => {
    let store;
    const testNodes = NODES_ABC;

    const getNodes = (): { [uuid: string]: RenderNode } => {
        let nodes;

        // return the last action for UPDATE_NODES
        for (const action of store.getActions()) {
            if (action.type === Constants.UPDATE_NODES) {
                nodes = action.payload.nodes;
            }
        }
        return nodes;
    };

    beforeEach(() => {
        // prep our store to show that we are editing
        store = createMockStore([thunk])({
            flowContext: { nodes: testNodes }
        });
    });

    describe('initializeFlow', () => {
        store = createMockStore([thunk])({});
        const colorsFlow = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json')
            .results[0].definition as FlowDefinition;
        store.dispatch(initializeFlow(colorsFlow));
        expect(getNodes()).toMatchSnapshot();
    });

    describe('updateAction', () => {
        it('should add new action', () => {
            // prep our store to show that we are editing
            store = createMockStore([thunk])({
                ...store.getState(),
                nodeEditor: { userAddingAction: true, nodeToEdit: testNodes.nodeA.node }
            });

            // add a new message to the first node
            store.dispatch(
                updateAction(
                    {
                        uuid: 'actionA',
                        type: 'send_msg',
                        text: 'A second message for our first node'
                    },
                    'nodeA'
                )
            );

            // we should have a new action
            const actions = getNodes().nodeA.node.actions;
            expect(actions.length).toBe(2);
            expect((actions[1] as SendMsg).text).toBe('A second message for our first node');
        });
    });

    describe('spliceInRouter', () => {
        it('should splice in a new node if needed', () => {
            const updatedNodes = { ...testNodes };
            updatedNodes.nodeA.node.actions.push({
                uuid: 'actionB',
                type: 'send_msg',
                text: 'A second message for our first node'
            } as SendMsg);

            updatedNodes.nodeA.node.actions.push({
                uuid: 'actionC',
                type: 'send_msg',
                text: 'A third message for our first node'
            } as SendMsg);

            store = createMockStore([thunk])({
                flowContext: { nodes: updatedNodes }
            });

            // now lets splice in a router in our middle action
            const renderNode: RenderNode = updatedNodes.nodeA;

            const newExitUUID = generateUUID();
            const renderNodes = store.dispatch(
                spliceInRouter(
                    renderNode.node.uuid,
                    {
                        router: {
                            type: 'switch',
                            cases: [],
                            default_exit_uuid: newExitUUID
                        } as SwitchRouter,
                        uuid: generateUUID(),
                        exits: [
                            {
                                uuid: newExitUUID,
                                name: 'Other',
                                destination_node_uuid: null
                            }
                        ]
                    },
                    'wait_for_response',
                    renderNode.node.actions[1]
                )
            );

            const nodes = getNodes();
            const topNode = nodes[renderNodes[0].node.uuid];
            const middleNode = nodes[renderNodes[1].node.uuid];
            const bottomNode = nodes[renderNodes[2].node.uuid];

            // top node should point to the middle node, and middle should point back
            expect(topNode.node.exits[0].destination_node_uuid).toBe(middleNode.node.uuid);
            expect(Object.keys(middleNode.inboundConnections)).toContain(
                topNode.node.exits[0].uuid
            );

            // middle should point to the bottom, and bottom should point back
            expect(middleNode.node.exits[0].destination_node_uuid).toBe(bottomNode.node.uuid);
            expect(Object.keys(bottomNode.inboundConnections)).toContain(
                middleNode.node.exits[0].uuid
            );

            // finally, the bottom node should point to the original destination
            expect(bottomNode.node.exits[0].destination_node_uuid).toBe(
                updatedNodes.nodeA.node.exits[0].destination_node_uuid
            );

            // original node should be gonezor
            expect(nodes[updatedNodes.nodeA.node.uuid]).toBeUndefined();
        });
    });

    describe('addNode', () => {
        it('should update exit destination and inbound connections', () => {
            let fromNode = testNodes.nodeB.node;
            const fromNodeUUID = fromNode.uuid;
            const fromExitUUID = fromNode.exits[0].uuid;

            const addedNode = store.dispatch(
                addNode({
                    node: { uuid: null, exits: [] },
                    ui: { position: { left: 200, top: 200 } },
                    inboundConnections: {
                        [fromExitUUID]: fromNodeUUID
                    }
                })
            );

            const nodes = getNodes();
            fromNode = nodes[fromNodeUUID].node;

            // our pointing node should be directed at us
            expect(fromNode.exits[0].destination_node_uuid).toBe(addedNode.node.uuid);
            expect(Object.keys(addedNode.inboundConnections)).toContain(fromNode.exits[0].uuid);
        });
    });

    it('should reflow nodes', () => {
        // we are starting at 150 which overlaps with nodeA
        expect(testNodes.nodeB.ui.position.top).toBe(150);

        // forcing a reflow should bump us down where we don't collid
        store.dispatch(reflow());
        expect(getNodes().nodeB.ui.position.top).toBe(200);
    });

    describe('removeNode', () => {
        it('should remove it from the map', () => {
            store.dispatch(removeNode(testNodes.nodeB.node));
            const nodes = getNodes();
            expect(nodes.nodeB).toBeUndefined();
        });

        it('should remove pointers from its destination', () => {
            store.dispatch(removeNode(testNodes.nodeA.node));
            const nodes = getNodes();
            const destinations = getUniqueDestinations(testNodes.nodeA.node);
            expect(destinations.length).toBe(1);

            // we were the only thing pointing to our friends, so now they
            // should have no inbound connections
            for (const nodeUUID of destinations) {
                expect(nodes[nodeUUID].inboundConnections).toEqual({});
            }
        });

        it('should reroute pass through connections', () => {
            store.dispatch(removeNode(testNodes.nodeB.node));

            const nodes = getNodes();

            // we reomved B, so now A should point to C
            expect(nodes.nodeA.node.exits[0].destination_node_uuid).toBe(nodes.nodeC.node.uuid);

            // and the next node in the tree should reflect our inbound connection
            expect(Object.keys(nodes.nodeC.inboundConnections)).toContain(
                testNodes.nodeA.node.exits[0].uuid
            );
        });

        // test a snapshot after removing each node in the flow
        for (const nodeUUID of Object.keys(testNodes)) {
            it('should remove node ' + nodeUUID, () => {
                store.dispatch(removeNode(testNodes[nodeUUID].node));
                const nodes = getNodes();
                expect(getNodes()).toMatchSnapshot('Remove ' + nodeUUID);
            });
        }
    });
});
