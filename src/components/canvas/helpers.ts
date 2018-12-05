import { FlowPosition } from '~/flowTypes';
import { CanvasPositions } from '~/store/editor';

export const collides = (a: FlowPosition, b: FlowPosition) => {
    // don't bother with collision if we don't have full dimensions
    /* istanbul ignore next */
    if (!a.bottom || !b.bottom) {
        return false;
    }

    return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
};

export const getCollisions = (
    positions: CanvasPositions,
    box: FlowPosition
): { [uuid: string]: FlowPosition } => {
    const collisions = {};
    for (const nodeUUID of Object.keys(positions)) {
        const position = positions[nodeUUID];
        if (collides(box, position)) {
            collisions[nodeUUID] = position;
        }
    }
    return collisions;
};
