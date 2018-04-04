import {
    updateConnection,
    removeConnection,
    addNode,
    addAction,
    updateAction,
    removeAction,
    moveActionUp,
    removeNode,
    updateNode,
    updatePosition,
    updateDimensions,
    updateLocalization
} from './mutators';
import { RenderNodeMap } from './flowContext';
import { SendMsg, FlowDefinition, FlowNode } from '../flowTypes';
import { dump } from '../utils';
import { NODES_ABC } from './__test__';
import { getNode, getExitIndex, getActionIndex } from './helpers';

describe('mutators', () => {
    const nodes = NODES_ABC;

    it('should throw for missing nodes', () => {
        expect(() => {
            getNode(nodes, 'missing-node');
        }).toThrowError('Cannot find node missing-node');
    });

    it('should throw for missing exits', () => {
        expect(() => {
            getExitIndex(nodes.nodeA.node, 'missing-exit');
        }).toThrowError('Cannot find exit missing-exit');
    });

    it('should throw for missing actions', () => {
        expect(() => {
            getActionIndex(nodes.nodeA.node, 'missing-action');
        }).toThrowError('Cannot find action missing-action');
    });

    describe('updateConnection()', () => {
        it('should update connections', () => {
            const updated = updateConnection(nodes, 'nodeA', 'exitA', 'nodeC');
            expect(updated.nodeA.node.exits[0].destination_node_uuid).toBe('nodeC');
            expect(updated).toMatchSnapshot();
        });

        it('should allow clearing connection', () => {
            const updated = updateConnection(nodes, 'nodeA', 'exitA', null);
            expect(updated.nodeA.node.exits[0].destination_node_uuid).toBeNull();
            expect(updated).toMatchSnapshot();
        });

        it('should update without a previous destination', () => {
            const updated = updateConnection(nodes, 'nodeC', 'exitC', 'nodeA');
            expect(updated.nodeC.node.exits[0].destination_node_uuid).toBe('nodeA');
            expect(updated).toMatchSnapshot();
        });
    });

    it('should removeConnection', () => {
        const updated = removeConnection(nodes, 'nodeA', 'exitA');
        expect(updated.nodeA.node.exits[0].destination_node_uuid).toBeNull();
        expect(updated).toMatchSnapshot();
    });

    it('should addNode', () => {
        const updated = addNode(nodes, {
            node: { uuid: 'nodeD', actions: [], exits: [] },
            ui: { position: { left: 400, top: 400 } },
            inboundConnections: { exitA: 'nodeA' }
        });

        expect(updated.nodeD).not.toBeUndefined();
        expect(updated.nodeA.node.exits[0].destination_node_uuid).toBe('nodeD');
        expect(updated).toMatchSnapshot();
    });

    it('should addAction', () => {
        const updated = addAction(nodes, 'nodeB', {
            uuid: 'actionB',
            type: 'send_msg',
            text: 'Hello World'
        } as SendMsg);

        const action = updated.nodeB.node.actions[0] as SendMsg;
        expect(action.type).toBe('send_msg');
        expect(action.text).toBe('Hello World');
        expect(updated).toMatchSnapshot();
    });

    describe('updateAction()', () => {
        it("should throw if trying to update an action that doesn't exist", () => {
            expect(() => {
                updateAction(nodes, 'nodeA', {
                    uuid: 'missing-action',
                    type: 'send_msg',
                    text: 'Hello World'
                } as SendMsg);
            }).toThrowError('Cannot find action missing-action');
        });

        it('should update an existing action', () => {
            let updated = addAction(nodes, 'nodeB', {
                uuid: 'actionB',
                type: 'send_msg',
                text: 'Hello World'
            } as SendMsg);

            updated = updateAction(updated, 'nodeB', {
                uuid: 'actionB',
                type: 'send_msg',
                text: 'Goodbye World'
            } as SendMsg);

            // should still only have one action since we updated
            expect(updated.nodeB.node.actions.length).toBe(1);

            const action = updated.nodeB.node.actions[0] as SendMsg;
            expect(action.type).toBe('send_msg');
            expect(action.text).toBe('Goodbye World');
            expect(updated).toMatchSnapshot();
        });
    });

    it('should removeAction', () => {
        const updated = removeAction(nodes, 'nodeA', 'actionA');
        expect(updated.nodeA.node.actions.length).toBe(0);
        expect(updated).toMatchSnapshot();
    });

    describe('moveActionUp()', () => {
        it('should throw if trying to move beyond the top', () => {
            expect(() => {
                const updated = moveActionUp(nodes, 'nodeA', 'actionA');
            }).toThrowError('Cannot move an action at the top upwards');
        });

        it('should move action up', () => {
            let updated = addAction(nodes, 'nodeA', {
                uuid: 'actionB',
                type: 'send_msg',
                text: 'Move me up'
            } as SendMsg);

            updated = moveActionUp(updated, 'nodeA', 'actionB');
            expect(updated.nodeA.node.actions[0].uuid).toBe('actionB');
            expect(updated).toMatchSnapshot();
        });
    });

    describe('removeNode()', () => {
        it('should remove action nodes', () => {
            const updated = removeNode(nodes, 'nodeA');
            expect(updated.nodeA).toBeUndefined();
            expect(Object.keys(updated.nodeB.inboundConnections)).not.toContain('exitA');
        });

        it('should remove multi-exit router nodes', () => {
            const updated = removeNode(nodes, 'nodeD');
            expect(updated.nodeD).toBeUndefined();
        });

        it('should remove single exit router nodes', () => {
            const updated = removeNode(nodes, 'nodeE');
            expect(updated.nodeE).toBeUndefined();
        });
    });

    it('should update an action node to a split', () => {
        const node = { ...nodes.nodeA.node, actions: [], router: { type: 'split' } };
        const updated = updateNode(nodes, node, 'wait_for_message');
        expect(updated.nodeA.node.router.type).toBe('split');
        expect(updated.nodeA.node.actions.length).toBe(0);
        expect(updated.nodeA.ui.type).toBe('wait_for_message');
    });

    it('should updatePosition()', () => {
        const updated = updatePosition(nodes, 'nodeA', 500, 1000);
        expect(updated.nodeA.ui.position).toEqual({
            left: 500,
            top: 1000,
            right: 700,
            bottom: 1090
        });
    });

    it('should updateDimensions()', () => {
        const updated = updateDimensions(nodes, 'nodeA', { width: 250, height: 350 });
        expect(updated.nodeA.ui.position).toEqual({ left: 100, top: 100, right: 350, bottom: 450 });
    });

    it('should updateLocalizations', () => {
        const nodeArray: FlowNode[] = [];
        Object.keys(nodes).forEach((key: string) => {
            nodeArray.push(nodes[key].node);
        });

        const definition: FlowDefinition = {
            uuid: 'flowA',
            name: 'Test Flow',
            localization: {},
            language: 'eng',
            nodes: nodeArray,
            _ui: { nodes: {}, languages: null }
        };

        let updated = updateLocalization(definition, 'spa', [
            { uuid: 'actionA', translations: [{ text: 'Hola Mundo!' }] }
        ]);

        expect(Object.keys(updated.localization)).toContain('spa');
        expect(updated.localization.spa).toEqual({ actionA: [{ text: 'Hola Mundo!' }] });
        expect(updated).toMatchSnapshot();

        // now clear it
        updated = updateLocalization(updated, 'spa', [{ uuid: 'actionA', translations: null }]);
        expect(updated.localization.spa).toEqual({});
        expect(updated).toMatchSnapshot();
    });
});
