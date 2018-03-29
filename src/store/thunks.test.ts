jest.unmock('redux-mock-store');
jest.unmock('immutability-helper');

// import {createMockStore} from 'redux-mock-store';
const createMockStore = require('redux-mock-store');
import thunk from 'redux-thunk';
import * as types from './actionTypes';
import { FlowDefinition } from '../flowTypes';
import { initializeFlow, removeNode } from './thunks';
import { dump } from '../utils';
import { getUniqueDestinations } from './helpers';
import { RenderNode } from './flowContext';

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
        store = createMockStore([thunk])({ flowContext: { definition, nodes } });
    });

    describe('removeNode', () => {
        const getNodes = (): { [uuid: string]: RenderNode } => {
            return store.getActions()[0].payload.nodes;
        };

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
