import {
    getSuggestedResultName,
    determineConfigType,
    getGhostNode,
    getLocalizations
} from './helpers';
import { v4 as generateUUID } from 'uuid';

import { NODES_ABC } from './__test__';
import { dump, getLocalization } from '../utils';

describe('helpers', () => {
    const nodes = NODES_ABC;
    it('should suggest response names', () => {
        const suggestison = getSuggestedResultName({
            nodeA: {
                node: { uuid: generateUUID(), exits: [] },
                ui: { position: { left: 100, top: 100 } }
            }
        });

        expect(suggestison).toBe('Response 2');
    });

    describe('getGhostNode', () => {
        it('should create a router from an action', () => {
            const ghost = getGhostNode(nodes.nodeA, nodes);
            expect(ghost.router.type).toBe('switch');
        });
        it('should create an action node from a switch', () => {
            const ghost = getGhostNode(nodes.nodeD, nodes);
            expect(ghost.router).toBeUndefined();
            expect(ghost.actions[0].type).toBe('send_msg');
        });
    });

    describe('determinConfigType', () => {
        it('should determine config type from action', () => {
            const configType = determineConfigType(
                nodes.nodeA.node,
                nodes.nodeA.node.actions[0],
                nodes
            );
            expect(configType).toBe('send_msg');
        });

        it('should return last action type if no action provided', () => {
            const configType = determineConfigType(nodes.nodeA.node, null, nodes);
            expect(configType).toBe('send_msg');
        });

        it('should use the router type if no actions', () => {
            const configType = determineConfigType(nodes.nodeD.node, null, nodes);
            expect(configType).toBe('wait_for_response');
        });

        it('should determine type from a brand new router', () => {
            const configType = determineConfigType(
                {
                    uuid: 'new-node',
                    exits: [],
                    router: {
                        type: 'switch'
                    }
                },
                null,
                nodes
            );

            // TODO: is this a valid type config type for the caller?
            expect(configType).toBe('switch');
        });

        it('should throw if no type is poissible', () => {
            expect(() => {
                determineConfigType(
                    {
                        uuid: 'new-node',
                        exits: []
                    },
                    null,
                    nodes
                );
            }).toThrowError('Cannot initialize NodeEditor without a valid type: new-node');
        });
    });
});
