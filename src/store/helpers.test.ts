import { Types } from '~/config/typeConfigs';
import { Case, Exit, FlowDefinition, FlowPosition, RouterTypes, SendMsg } from '~/flowTypes';
import {
    generateResultQuery,
    getCollisions,
    getFlowComponents,
    getGhostNode,
    getLocalizations,
    getOrderedNodes,
    getUniqueDestinations
} from '~/store/helpers';
import { Spanish } from '~/testUtils/assetCreators';

const mutate = require('immutability-helper');

describe('helpers', () => {
    const definition: FlowDefinition = require('~/test/flows/boring.json');

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

        it('should find results in definition', () => {
            const { resultMap } = getFlowComponents(definition);
            const expectedOutput = {
                node1: generateResultQuery(definition.nodes[1].router.result_name)
            };
            expect(resultMap).toEqual(expectedOutput);
            expect(resultMap).toMatchSnapshot();
        });
    });

    describe('RenderNodeMap', () => {
        const nodes = getFlowComponents(definition).renderNodeMap;

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
                const ghost = getGhostNode(nodes.node0, 1);
                expect(ghost.node.router.type).toBe(RouterTypes.switch);
            });
            it('should create an action node from a switch', () => {
                const ghost = getGhostNode(nodes.node1, 1);
                expect(ghost.node.router).toBeUndefined();
                expect(ghost.node.actions[0].type).toBe(Types.send_msg);
            });
        });
    });
});
