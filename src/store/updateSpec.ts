import update from 'immutability-helper';
import { Node, UINode } from '../flowTypes';
import { v4 as generateUUID } from 'uuid';

export const uniquifyNode = (newNode: Node) => {
    // Give our node a unique uuid
    return update(newNode, { $merge: { uuid: generateUUID() } });
};

export const prepAddNode = (newNode: Node, ui: UINode, updateSpec: any = {}): any => {
    // Add our node
    return {
        ...updateSpec,
        nodes: {
            $push: [newNode]
        },
        _ui: {
            nodes: { $merge: { [newNode.uuid]: ui } }
        }
    };
};

export const prepSetNode = (
    nodeIdx: number,
    newNode: Node,
    type?: string,
    updateSpec: any = {}
): any => {
    let newSpec = {
        ...updateSpec,
        nodes: { [nodeIdx]: { $set: newNode } }
    };

    if (type !== null) {
        newSpec = prepUpdateNodeUI(newNode.uuid, { type }, newSpec);
    }

    return newSpec;
};

const prepUpdateNodeUI = (uuid: string, changes: any, updateSpec: any = {}): any => {
    return {
        ...updateSpec,
        _ui: { nodes: { [uuid]: { $merge: changes } } }
    };
};
