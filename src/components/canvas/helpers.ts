import { FlowPosition } from '~/flowTypes';
import { CanvasPositions } from '~/store/editor';
import { NODE_SPACING, set, snapPositionToGrid, timeEnd, timeStart } from '~/utils';

const mutate = require('immutability-helper');

export const collides = (a: FlowPosition, b: FlowPosition) => {
    // don't bother with collision if we don't have full dimensions
    /* istanbul ignore next */
    if (!a.bottom || !b.bottom) {
        return false;
    }

    return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
};

export const getDraggablesInBox = (
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

interface DraggablePosition extends FlowPosition {
    uuid: string;
}

const getOrderedDraggables = (positions: CanvasPositions): DraggablePosition[] => {
    const sorted: DraggablePosition[] = [];
    Object.keys(positions).forEach((uuid: string) => {
        sorted.push({ ...positions[uuid], uuid });
    });
    return sorted.sort((a: DraggablePosition, b: DraggablePosition) => {
        let diff = a.top - b.top;
        if (diff === 0) {
            diff = a.left - b.left;
        }
        return diff;
    });
};

/**
 * Gets the first collsion in the node map returning the original node,
 * the node it collides with and optionally an additional node it
 * collides with if inserting between two nodes
 * @param nodes
 */
const getFirstCollision = (positions: CanvasPositions): DraggablePosition[] => {
    const sortedDraggables = getOrderedDraggables(positions);

    for (let i = 0; i < sortedDraggables.length; i++) {
        const current = sortedDraggables[i];
        if (i + 1 < sortedDraggables.length) {
            for (let j = i + 1; j < sortedDraggables.length; j++) {
                const other = sortedDraggables[j];
                if (collides(current, other)) {
                    // if the next node collides too, include it
                    // to deal with inserting between two closely
                    // positioned nodes
                    if (j + 1 < sortedDraggables.length) {
                        const cascaded = sortedDraggables[j + 1];
                        if (collides(other, cascaded)) {
                            return [current, other, cascaded];
                        }
                    }
                    return [current, other];
                }
            }
        }
    }
    return [];
};

const setTop = (position: FlowPosition, newTop: number) => {
    return snapPositionToGrid({
        top: newTop,
        left: position.left,
        bottom: newTop + (position.bottom - position.top),
        right: position.right
    });
};

/**
 * Reflow positions to account for any collisions
 * @param positions
 */
export const reflow = (
    positions: CanvasPositions
): { positions: CanvasPositions; changed: string[] } => {
    let newPositions = positions;
    const changed: string[] = [];

    timeStart('reflow');

    let collision = getFirstCollision(positions);
    while (collision.length > 0) {
        if (collision.length) {
            const [top, bottom, cascade] = collision;
            newPositions = mutate(newPositions, {
                [bottom.uuid]: set(setTop(bottom, top.bottom + NODE_SPACING))
            });
            changed.push(bottom.uuid);

            if (cascade) {
                // start with the top of the bottom node
                let cascadeTop = top.bottom + NODE_SPACING;

                // and add its height
                cascadeTop += bottom.bottom - bottom.top;
                newPositions = mutate(newPositions, {
                    [cascade.uuid]: set(setTop(cascade, cascadeTop))
                });

                changed.push(cascade.uuid);
            }
        }

        collision = getFirstCollision(newPositions);
    }

    timeEnd('reflow');

    return { positions: newPositions, changed };
};
