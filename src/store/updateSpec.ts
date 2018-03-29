import update from 'immutability-helper';
import { Node, UINode } from '../flowTypes';
import { v4 as generateUUID } from 'uuid';
import { RenderNode } from './flowContext';

export const uniquifyNode = (newNode: Node): Node => {
    // Give our node a unique uuid
    return update(newNode, { $merge: { uuid: generateUUID() } });
};

export const prepUpdateDestination = (
    fromNodeUUID: string,
    fromExitUUID: string,
    exitIdx: string,
    destination: string,
    updateSpec = {}
) => {
    let newUpdate = updateSpec;

    // see if we should be adding to an existing merge
    if (newUpdate[fromNodeUUID]) {
        newUpdate[fromNodeUUID].node.exits[exitIdx] = {
            $merge: { destination_node_uuid: destination }
        };

        if (destination) {
            newUpdate[destination].inboundConnections.$merge[fromExitUUID] = fromNodeUUID;
        }
    } else {
        newUpdate = {
            [fromNodeUUID]: {
                node: { exits: { [exitIdx]: { $merge: { destination_node_uuid: destination } } } }
            }
        };

        if (destination) {
            newUpdate[destination] = {
                inboundConnections: { $merge: { [fromExitUUID]: fromNodeUUID } }
            };
        }
    }

    return newUpdate;
};
