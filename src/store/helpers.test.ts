import { FlowTypes, Types } from '~/config/interfaces';
import {
    Case,
    Exit,
    FlowDefinition,
    FlowPosition,
    RouterTypes,
    SendMsg,
    Category
} from '~/flowTypes';
import {
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
            expect(flowDetails.groups).toMatchSnapshot();
        });

        it('should find fields in definition', () => {
            const flowDetails = getFlowComponents(definition);
            expect(flowDetails.fields).toMatchSnapshot();
        });

        it('should find labels in definition', () => {
            const flowDetails = getFlowComponents(definition);
            expect(flowDetails.labels).toMatchSnapshot();
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
                expect(Object.keys(getCollisions(nodes, {}, box))).toEqual(collisions);
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
                    node1_cat0: { name: ['this is espanols'] },
                    node1_case0: { arguments: ['espanol case'] }
                };

                const localizations = getLocalizations(
                    node,
                    node.actions[0],
                    Spanish,
                    translations
                );

                expect((localizations[0].getObject() as Case).arguments).toEqual(['espanol case']);
                expect((localizations[2].getObject() as Category).name).toEqual([
                    'this is espanols'
                ]);
            });
        });

        describe('getGhostNode', () => {
            it('should create a router from an action', () => {
                const ghost = getGhostNode(
                    nodes.node0,
                    nodes.node0.node.exits[0].uuid,
                    1,
                    FlowTypes.MESSAGE
                );
                expect(ghost.node.router.type).toBe(RouterTypes.switch);
            });
            it('should create an action node from a switch', () => {
                const ghost = getGhostNode(
                    nodes.node1,
                    nodes.node1.node.exits[0].uuid,
                    1,
                    FlowTypes.MESSAGE
                );
                expect(ghost.node.router).toBeUndefined();
                expect(ghost.node.actions[0].type).toBe(Types.send_msg);
            });
        });
    });
});
