import {
    updateConnection,
    removeConnection,
    mergeNode,
    addAction,
    updateAction,
    removeAction,
    moveActionUp,
    removeNode,
    updatePosition,
    updateDimensions,
    updateLocalization,
    removeNodeAndRemap
} from './mutators';
import { RenderNodeMap } from './flowContext';
import { SendMsg, FlowDefinition, FlowNode } from '../flowTypes';
import { dump } from '../utils';
import { getNode, getExitIndex, getActionIndex, getFlowComponents } from './helpers';
import { Types } from '../config/typeConfigs';

describe('mutators', () => {
    const definition: FlowDefinition = require('../../__test__/flows/boring.json');
    const { renderNodeMap: nodes } = getFlowComponents(definition);

    it('should throw for missing nodes', () => {
        expect(() => {
            getNode(nodes, 'missing-node');
        }).toThrowError('Cannot find node missing-node');
    });

    it('should throw for missing exits', () => {
        expect(() => {
            getExitIndex(nodes.node0.node, 'missing-exit');
        }).toThrowError('Cannot find exit missing-exit');
    });

    it('should throw for missing actions', () => {
        expect(() => {
            getActionIndex(nodes.node0.node, 'missing-action');
        }).toThrowError('Cannot find action missing-action');
    });

    describe('updateConnection()', () => {
        it('should update connections', () => {
            const updated = updateConnection(nodes, 'node0', 'node0_exit0', 'node2');
            expect(updated.node0.node.exits[0].destination_node_uuid).toBe('node2');
            expect(updated).toMatchSnapshot();
        });

        it('should allow clearing connection', () => {
            const updated = updateConnection(nodes, 'node0', 'node0_exit0', null);
            expect(updated.node0.node.exits[0].destination_node_uuid).toBeNull();
            expect(updated).toMatchSnapshot();
        });

        it('should update without a previous destination', () => {
            const updated = updateConnection(nodes, 'node2', 'node2_exit0', 'node0');
            expect(updated.node2.node.exits[0].destination_node_uuid).toBe('node0');
            expect(updated).toMatchSnapshot();
        });
    });

    it('should removeConnection', () => {
        const updated = removeConnection(nodes, 'node0', 'node0_exit0');
        expect(updated.node0.node.exits[0].destination_node_uuid).toBeNull();
        expect(updated).toMatchSnapshot();
    });

    it('should addNode', () => {
        const updated = mergeNode(nodes, {
            node: { uuid: 'node3', actions: [], exits: [] },
            ui: { position: { left: 600, top: 400 } },
            inboundConnections: { node0_exit0: 'node0' }
        });

        expect(updated.node3).not.toBeUndefined();
        expect(updated.node0.node.exits[0].destination_node_uuid).toBe('node3');
        expect(updated).toMatchSnapshot();
    });

    it('should addAction', () => {
        const updated = addAction(nodes, 'node0', {
            uuid: 'node0_action4',
            type: Types.send_msg,
            text: 'Hello World'
        } as SendMsg);

        const action = updated.node0.node.actions[4] as SendMsg;
        expect(action.type).toBe(Types.send_msg);
        expect(action.text).toBe('Hello World');
        expect(updated).toMatchSnapshot();
    });

    describe('updateAction()', () => {
        it("should throw if trying to update an action that doesn't exist", () => {
            expect(() => {
                updateAction(nodes, 'node0', {
                    uuid: 'missing-action',
                    type: Types.send_msg,
                    text: 'Hello World'
                } as SendMsg);
            }).toThrowError('Cannot find action missing-action');
        });

        it('should update an action that was added', () => {
            let updated = addAction(nodes, 'node0', {
                uuid: 'node0_action3',
                type: Types.send_msg,
                text: 'Hello World'
            } as SendMsg);

            updated = updateAction(updated, 'node0', {
                uuid: 'node0_action3',
                type: Types.send_msg,
                text: 'Goodbye World'
            } as SendMsg);

            // we added one to get to four and then edited it
            expect(updated.node0.node.actions.length).toBe(5);

            const action = updated.node0.node.actions[3] as SendMsg;
            expect(action.type).toBe(Types.send_msg);
            expect(action.text).toBe('Goodbye World');
            expect(updated).toMatchSnapshot();
        });
    });

    it('should removeAction', () => {
        const updated = removeAction(nodes, 'node0', 'node0_action0');
        expect(updated.node0.node.actions.length).toBe(3);
        expect(updated).toMatchSnapshot();
    });

    describe('moveActionUp()', () => {
        it('should throw if trying to move beyond the top', () => {
            expect(() => {
                const updated = moveActionUp(nodes, 'node0', 'node0_action0');
            }).toThrowError('Cannot move an action at the top upwards');
        });

        it('should move action up', () => {
            const updated = moveActionUp(nodes, 'node0', 'node0_action1');
            expect(updated.node0.node.actions[0].uuid).toBe('node0_action1');
            expect(updated).toMatchSnapshot();
        });
    });

    describe('removeNodeAndRemap()', () => {
        it('should remove action nodes', () => {
            const updated = removeNodeAndRemap(nodes, 'node0');
            expect(updated.node0).toBeUndefined();
            expect(Object.keys(updated.node1.inboundConnections)).not.toContain('node0_exit0');
        });

        it('should remove multi-exit router nodes', () => {
            const updated = removeNodeAndRemap(nodes, 'node1');
            expect(updated.node1).toBeUndefined();
        });
    });

    it('should update an action node to a split', () => {
        const node = { ...nodes.node0.node, actions: [], router: { type: 'split' } };
        const updated = mergeNode(nodes, {
            node,
            ui: { type: 'wait_for_message', position: null },
            inboundConnections: {}
        });
        expect(updated.node0.node.router.type).toBe('split');
        expect(updated.node0.node.actions.length).toBe(0);
        expect(updated.node0.ui.type).toBe('wait_for_message');
    });

    it('should updatePosition()', () => {
        const updated = updatePosition(nodes, 'node0', 500, 1000);
        expect(updated.node0.ui.position).toEqual({
            left: 500,
            top: 1000,
            right: 720,
            bottom: 1254
        });
    });

    it('should updateDimensions()', () => {
        const updated = updateDimensions(nodes, 'node0', { width: 250, height: 350 });
        expect(updated.node0.ui.position).toEqual({ left: 0, top: 0, right: 250, bottom: 350 });
    });

    it('should updateLocalizations', () => {
        let updated = updateLocalization(definition, 'spa', [
            { uuid: 'node0_action0', translations: [{ text: 'Hola Mundo!' }] }
        ]);

        expect(Object.keys(updated.localization)).toContain('spa');
        expect(updated.localization.spa).toEqual({ node0_action0: [{ text: 'Hola Mundo!' }] });
        expect(updated).toMatchSnapshot();

        // now clear it
        updated = updateLocalization(updated, 'spa', [
            { uuid: 'node0_action0', translations: null }
        ]);
        expect(updated.localization.spa).toEqual({});
        expect(updated).toMatchSnapshot();
    });
});
