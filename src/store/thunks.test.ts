jest.unmock('redux-mock-store');
jest.unmock('immutability-helper');

// import {createMockStore} from 'redux-mock-store';
const createMockStore = require('redux-mock-store');
import thunk from 'redux-thunk';
import * as types from './actionTypes';
import { FlowDefinition, SendMsg, AnyAction, Node, SwitchRouter } from '../flowTypes';
import { initializeFlow, removeNode, addNode, updateAction, spliceInRouter } from './thunks';
import { dump } from '../utils';
import { getUniqueDestinations } from './helpers';
import { RenderNode } from './flowContext';
import { v4 as generateUUID } from 'uuid';
import { Constants } from '.';

const colorsFlow = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json')
    .results[0].definition as FlowDefinition;

describe('thunks', () => {
    let store;

    beforeEach(() => {
        store = createMockStore([thunk])({});
        store.dispatch(initializeFlow(colorsFlow));

        const actions = store.getActions();
        const { definition } = actions[0].payload;
        const { nodes } = actions[1].payload;

        // we want an initial store based on a fetched flow
        store = createMockStore([thunk])({ flowContext: { nodes } });
    });

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

    /**
     * A helper method to add an action to our initial state
     * @param node the node to add the action to
     * @param action the new action to add
     */
    const addActionToState = (node: Node, action: AnyAction) => {
        // prep our store to show that we are editing
        store = createMockStore([thunk])({
            ...store.getState(),
            nodeEditor: { userAddingAction: true, nodeToEdit: node }
        });

        // add the action to the specified node
        store.dispatch(updateAction(action, node.uuid));

        // reset our store with our new nodes, an non editing state
        store = createMockStore([thunk])({
            ...store.getState(),
            nodeEditor: { userAddingAction: false, nodeToEdit: null },
            flowContext: { nodes: getNodes() }
        });
    };

    describe('updateAction', () => {
        it('should add new action', () => {
            // prep our store to show that we are editing
            store = createMockStore([thunk])({
                ...store.getState(),
                nodeEditor: { userAddingAction: true, nodeToEdit: colorsFlow.nodes[0] }
            });

            // add a new message to the first node
            store.dispatch(
                updateAction(
                    {
                        uuid: '1e79f536-2ca2-477c-80c4-518f31ae8755',
                        type: 'send_msg',
                        text: 'A second message for our first node'
                    },
                    colorsFlow.nodes[0].uuid
                )
            );

            // we should have a new action
            const actions = getNodes()[colorsFlow.nodes[0].uuid].node.actions;
            expect(actions.length).toBe(2);
            expect((actions[1] as SendMsg).text).toBe('A second message for our first node');
        });
    });

    describe('spliceInRouter', () => {
        it('should splice in a new node if needed', () => {
            // initialize our state with a couple more actions in the first node
            addActionToState(colorsFlow.nodes[0], {
                uuid: '1e79f536-2ca2-477c-80c4-518f31ae8755',
                type: 'send_msg',
                text: 'A second message for our first node'
            });

            addActionToState(colorsFlow.nodes[0], {
                uuid: '992d96b3-9015-4578-9dd1-0d14450a0449',
                type: 'send_msg',
                text: 'A third message for our first node'
            });

            // now lets splice in a router in our middle action
            const renderNode: RenderNode = store.getState().flowContext.nodes[
                colorsFlow.nodes[0].uuid
            ];

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
                colorsFlow.nodes[0].exits[0].destination_node_uuid
            );

            // original node should be gonezor
            expect(nodes[colorsFlow.nodes[0].uuid]).toBeUndefined();
        });
    });

    describe('addNode', () => {
        it('should update exit destination and inbound connections', () => {
            // we are dragging from the group split 'other' case
            const pointerNode = colorsFlow.nodes[5];
            const fromNodeUUID = pointerNode.uuid;
            const fromExitUUID = pointerNode.exits[pointerNode.exits.length - 1].uuid;

            const addedNode = store.dispatch(
                addNode({
                    node: { uuid: null, exits: [] },
                    ui: { position: { x: 200, y: 200 } },
                    inboundConnections: {
                        [fromExitUUID]: fromNodeUUID
                    }
                })
            );

            const nodes = getNodes();
            const fromNode = nodes[fromNodeUUID];

            // our pointing node should be directed at us
            expect(fromNode.node.exits[2].destination_node_uuid).toBe(addedNode.node.uuid);
            expect(Object.keys(addedNode.inboundConnections)).toContain(
                fromNode.node.exits[2].uuid
            );
        });
    });

    describe('removeNode', () => {
        it('should remove it from the map', () => {
            store.dispatch(removeNode(colorsFlow.nodes[1]));
            const nodes = getNodes();
            expect(nodes[colorsFlow.nodes[1].uuid]).toBeUndefined();
        });

        it('should remove pointers from its destination', () => {
            store.dispatch(removeNode(colorsFlow.nodes[1]));
            const nodes = getNodes();
            const destinations = getUniqueDestinations(colorsFlow.nodes[1]);
            expect(destinations.length).toBe(2);

            // we were the only thing pointing to our friends, so now they
            // should have no inbound connections
            for (const nodeUUID of destinations) {
                expect(nodes[nodeUUID].inboundConnections).toEqual({});
            }
        });

        it('should reroute pass through connections', () => {
            store.dispatch(removeNode(colorsFlow.nodes[3]));

            const fromNode = colorsFlow.nodes[2];
            const toNode = colorsFlow.nodes[6];

            const nodes = getNodes();

            // our exit should be pointing to the next node in the tree
            expect(nodes[fromNode.uuid].node.exits[0].destination_node_uuid).toBe(toNode.uuid);

            // and the next node in the tree should reflect our inbound connection
            expect(Object.keys(nodes[toNode.uuid].inboundConnections)).toContain(
                fromNode.exits[0].uuid
            );
        });

        // test a snapshot after removing each node in the flow
        for (const node of colorsFlow.nodes) {
            it('should remove node ' + node.uuid, () => {
                store.dispatch(removeNode(colorsFlow.nodes[1]));
                const nodes = getNodes();
                expect(getNodes()).toMatchSnapshot('Remove ' + node.uuid);
            });
        }
    });
});
