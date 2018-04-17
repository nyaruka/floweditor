import { v4 as generateUUID } from 'uuid';
import { Types } from '../config/typeConfigs';
import { Case, Exit, FlowDefinition, FlowPosition, SendMsg } from '../flowTypes';
import {
    determineConfigType,
    getCollisions,
    getFlowComponents,
    getGhostNode,
    getLocalizations,
    getSuggestedResultName,
    getUniqueDestinations
} from './helpers';

describe('helpers', () => {
    const definition: FlowDefinition = require('../../__test__/flows/boring.json');

    describe('initializeFlow', () => {
        it('should find groups in definition', () => {
            const flowDetails = getFlowComponents(definition);
            expect(flowDetails.groups).toEqual([
                { label: 'Flow Participants', value: 'group_0' },
                { label: 'Nonresponsive', value: 'group_1' }
            ]);
        });

        it('should find fields in definition', () => {
            const flowDetails = getFlowComponents(definition);
            expect(flowDetails.fields).toEqual([
                { label: 'Unknown Field', value: 'unknown_field' }
            ]);
        });
    });

    describe('RenderNodeMap', () => {
        const nodes = getFlowComponents(definition).renderNodeMap;

        it('should suggest response names', () => {
            const suggestison = getSuggestedResultName({
                node0: {
                    node: { uuid: generateUUID(), actions: [], exits: [] },
                    ui: { position: { left: 100, top: 100 } },
                    inboundConnections: {}
                }
            });

            expect(suggestison).toBe('Response 2');
        });

        it('should get unique destinations', () => {
            expect(getUniqueDestinations(nodes.node0.node)).toEqual(['node1']);
            expect(getUniqueDestinations(nodes.node1.node)).toEqual(['node2']);
            expect(getUniqueDestinations(nodes.node2.node)).toEqual(['node3']);
            expect(getUniqueDestinations(nodes.node3.node)).toEqual([]);
        });

        it('should identify collisions', () => {
            const collides = (box: FlowPosition, collisions: string[]) => {
                expect(Object.keys(getCollisions(nodes, box))).toEqual(collisions);
            };

            collides({ left: 0, top: 0, right: 200, bottom: 150 }, ['node0']);
            collides({ left: 0, top: 100, right: 200, bottom: 300 }, ['node0', 'node1']);
            collides({ left: 0, top: 100, right: 200, bottom: 500 }, ['node0', 'node1', 'node2']);
        });

        describe('getLocalizations', () => {
            it('should get localized actions', () => {
                const node = nodes.node0.node;
                const translations = { [node.actions[0].uuid]: { text: ['this is espanols'] } };

                const localizations = getLocalizations(
                    node,
                    node.actions[0],
                    'spa',
                    { spa: 'Spanish' },
                    translations
                );

                expect((localizations[0].getObject() as SendMsg).text).toEqual([
                    'this is espanols'
                ]);
            });

            it('should get localized cases', () => {
                const node = nodes.node1.node;
                const translations = {
                    node1_exit0: { name: ['this is espanols'] },
                    node1_case0: { arguments: ['espanol case'] }
                };

                const localizations = getLocalizations(
                    node,
                    node.actions[0],
                    'spa',
                    { spa: 'Spanish' },
                    translations
                );

                expect((localizations[0].getObject() as Case).arguments).toEqual(['espanol case']);
                expect((localizations[2].getObject() as Exit).name).toEqual(['this is espanols']);
            });
        });

        describe('getGhostNode', () => {
            it('should create a router from an action', () => {
                const ghost = getGhostNode(nodes.node0, nodes);
                expect(ghost.router.type).toBe('switch');
            });
            it('should create an action node from a switch', () => {
                const ghost = getGhostNode(nodes.node1, nodes);
                expect(ghost.router).toBeUndefined();
                expect(ghost.actions[0].type).toBe(Types.send_msg);
            });
        });

        describe('determineConfigType', () => {
            it('should determine config type from action', () => {
                const configType = determineConfigType(
                    nodes.node0.node,
                    nodes.node0.node.actions[0],
                    nodes
                );
                expect(configType).toBe(Types.send_msg);
            });

            it('should return last action type if no action provided', () => {
                const configType = determineConfigType(nodes.node0.node, null, nodes);
                expect(configType).toBe(Types.remove_contact_groups);
            });

            it('should use the router type if no actions', () => {
                const configType = determineConfigType(nodes.node1.node, null, nodes);
                expect(configType).toBe(Types.wait_for_response);
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
});
