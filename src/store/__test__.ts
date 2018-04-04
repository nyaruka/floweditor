import { RenderNodeMap } from './flowContext';
import { SendMsg, SwitchRouter } from '../flowTypes';

export const NODES_ABC: RenderNodeMap = {
    nodeA: {
        node: {
            uuid: 'nodeA',
            actions: [
                {
                    uuid: 'actionA',
                    type: 'send_msg',
                    text: 'The first message'
                } as SendMsg
            ],
            exits: [{ uuid: 'exitA', destination_node_uuid: 'nodeB' }]
        },
        ui: { position: { left: 100, top: 100, right: 300, bottom: 190 } },
        inboundConnections: {}
    },
    nodeB: {
        node: {
            uuid: 'nodeB',
            exits: [{ uuid: 'exitB', destination_node_uuid: 'nodeC' }],
            actions: []
        },
        ui: { position: { left: 200, top: 150, right: 500, bottom: 290 } },
        inboundConnections: { exitA: 'nodeA' }
    },
    nodeC: {
        node: {
            uuid: 'nodeC',
            exits: [{ uuid: 'exitC', destination_node_uuid: null }],
            actions: []
        },
        ui: { position: { left: 300, top: 210, right: 600, bottom: 390 } },
        inboundConnections: {}
    },
    nodeD: {
        node: {
            uuid: 'nodeD',
            actions: [],
            exits: [{ uuid: 'exitD', destination_node_uuid: null }],
            router: {
                type: 'switch',
                default_exit_uuid: 'exitD',
                cases: []
            } as SwitchRouter,
            wait: 'msg'
        },
        ui: {
            position: { left: 300, top: 1000, right: 700, bottom: 1190 },
            type: 'wait_for_response'
        },
        inboundConnections: {}
    }
};
