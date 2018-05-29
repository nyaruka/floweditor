import { v4 as generateUUID } from 'uuid';

import { Types } from '../config/typeConfigs';
import { Case, Exit, FlowDefinition, FlowPosition, RouterTypes, SendMsg } from '../flowTypes';
import { Spanish } from '../testUtils/assetCreators';
import {
    determineConfigType,
    generateCompletionOption,
    getCollisions,
    getFlowComponents,
    getGhostNode,
    getLocalizations,
    getOrderedNodes,
    getSuggestedResultName,
    getUniqueDestinations,
} from './helpers';

const mutate = require('immutability-helper');

describe('helpers', () => {
    const definition: FlowDefinition = require('../../__test__/flows/boring.json');

    describe('initializeFlow', () => {
        it('should find groups in definition', () => {
            const flowDetails = getFlowComponents(definition);
            expect(flowDetails.groups).toEqual([
                { name: 'Flow Participants', id: 'group_0', type: 'group' },
                { name: 'Nonresponsive', id: 'group_1', type: 'group' }
            ]);
        });

        it('should find fields in definition', () => {
            const flowDetails = getFlowComponents(definition);
            expect(flowDetails.fields).toEqual([
                { name: 'Unknown Field', id: 'unknown_field', type: 'field' }
            ]);
        });

        it('should find labels in definition', () => {
            const flowDetails = getFlowComponents(definition);
            expect(flowDetails.labels).toEqual([
                { name: 'Help', id: 'label_0', type: 'label' },
                { name: 'Feedback', id: 'label_1', type: 'label' }
            ]);
        });

        it('should find result names in definition', () => {
            const { resultNamesMap } = getFlowComponents(definition);
            const expectedOutput = {
                node1: generateCompletionOption(definition.nodes[1].router.result_name)
            };
            expect(resultNamesMap).toEqual(expectedOutput);
            expect(resultNamesMap).toMatchSnapshot();
        });
    });

    describe('RenderNodeMap', () => {
        const nodes = getFlowComponents(definition).renderNodeMap;

        it('should suggest response names', () => {
            const suggestion = getSuggestedResultName({
                node0: {
                    node: { uuid: generateUUID(), actions: [], exits: [] },
                    ui: { position: { left: 100, top: 100 } },
                    inboundConnections: {}
                }
            });

            expect(suggestion).toBe('Result 1');
        });

        it('should get unique destinations', () => {
            expect(getUniqueDestinations(nodes.node0.node)).toEqual(['node1']);
            expect(getUniqueDestinations(nodes.node1.node)).toEqual(['node2']);
            expect(getUniqueDestinations(nodes.node2.node)).toEqual(['node3']);
            expect(getUniqueDestinations(nodes.node3.node)).toEqual([]);
        });

        it('should get ordered nodes', () => {
            const nodesToOrder = mutate(nodes, {
                node1: {
                    ui: { position: { $merge: { top: 0, left: 500 } } }
                }
            });

            const ordered = getOrderedNodes(nodesToOrder);
            expect(ordered[0].node.uuid).toBe('node0');
            expect(ordered[1].node.uuid).toBe('node1');
            expect(ordered).toMatchSnapshot();
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
                    Spanish,
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
                    Spanish,
                    translations
                );

                expect((localizations[0].getObject() as Case).arguments).toEqual(['espanol case']);
                expect((localizations[2].getObject() as Exit).name).toEqual(['this is espanols']);
            });
        });

        describe('getGhostNode', () => {
            it('should create a router from an action', () => {
                const ghost = getGhostNode(nodes.node0, nodes);
                expect(ghost.router.type).toBe(RouterTypes.switch);
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
                expect(configType).toBe(Types.add_input_labels);
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
                            type: RouterTypes.switch
                        }
                    },
                    null,
                    nodes
                );

                // TODO: is this a valid type config type for the caller?
                expect(configType).toBe(RouterTypes.switch);
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
