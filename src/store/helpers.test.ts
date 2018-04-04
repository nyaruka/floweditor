import {
    getSuggestedResultName,
    determineConfigType,
    getGhostNode,
    getLocalizations,
    getUniqueDestinations
} from './helpers';
import { v4 as generateUUID } from 'uuid';

import { NODES_ABC } from './__test__';
import { dump, getLocalization } from '../utils';
import { AnyAction, SendMsg, Exit, Case } from '../flowTypes';

describe('helpers', () => {
    const nodes = NODES_ABC;
    it('should suggest response names', () => {
        const suggestison = getSuggestedResultName({
            nodeA: {
                node: { uuid: generateUUID(), actions: [], exits: [] },
                ui: { position: { left: 100, top: 100 } },
                inboundConnections: {}
            }
        });

        expect(suggestison).toBe('Response 2');
    });

    it('should get unique destinations', () => {
        expect(getUniqueDestinations(nodes.nodeA.node)).toEqual(['nodeB']);
        expect(getUniqueDestinations(nodes.nodeD.node)).toEqual(['nodeE']);
        expect(getUniqueDestinations(nodes.nodeE.node)).toEqual([]);
    });

    describe('getLocalizations', () => {
        it('should get localized actions', () => {
            const node = nodes.nodeA.node;
            const translations = { [node.actions[0].uuid]: { text: ['this is espanols'] } };

            const localizations = getLocalizations(
                node,
                node.actions[0],
                'spa',
                { spa: 'Spanish' },
                translations
            );

            expect((localizations[0].getObject() as SendMsg).text).toEqual(['this is espanols']);
        });

        it('should get localized cases', () => {
            const node = nodes.nodeD.node;
            const translations = { exitD: { name: ['this is espanols'], caseA: ['espanol case'] } };

            const localizations = getLocalizations(
                node,
                node.actions[0],
                'spa',
                { spa: 'Spanish' },
                translations
            );

            expect((localizations[0].getObject() as Case).arguments).toEqual(['casetest']);
            expect((localizations[1].getObject() as Exit).name).toEqual(['this is espanols']);
        });
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

    describe('determineConfigType', () => {
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
                    actions: [],
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
                        actions: [],
                        exits: []
                    },
                    null,
                    nodes
                );
            }).toThrowError('Cannot initialize NodeEditor without a valid type: new-node');
        });
    });
});
