import { FlowPosition } from 'flowTypes';
import { CanvasPositions } from 'store/editor';
import {
  MAX_REFLOW_ATTEMPTS,
  NODE_SPACING,
  set,
  snapPositionToGrid,
  timeEnd,
  timeStart
} from 'utils';

const mutate = require('immutability-helper');

export const collides = (a: FlowPosition, b: FlowPosition, fudge: number) => {
  // don't bother with collision if we don't have full dimensions
  /* istanbul ignore next */
  if (!a.bottom || !b.bottom) {
    return false;
  }

  a.bottom += fudge;

  return !(b.left > a.right! || b.right! < a.left || b.top > a.bottom || b.bottom < a.top);
};

export const getDraggablesInBox = (
  positions: CanvasPositions,
  box: FlowPosition
): { [uuid: string]: FlowPosition } => {
  const collisions: any = {};
  for (const nodeUUID of Object.keys(positions)) {
    const position = positions[nodeUUID];
    if (collides(box, position, 0)) {
      collisions[nodeUUID] = position;
    }
  }
  return collisions;
};

interface DraggablePosition extends FlowPosition {
  uuid: string;
}

export const getOrderedDraggables = (positions: CanvasPositions): DraggablePosition[] => {
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
const getFirstCollision = (
  positions: CanvasPositions,
  changed: string[],
  fudge: number
): DraggablePosition[] => {
  const sortedDraggables = getOrderedDraggables(positions);

  for (let i = 0; i < sortedDraggables.length; i++) {
    const current = sortedDraggables[i];

    if (i + 1 < sortedDraggables.length) {
      for (let j = i + 1; j < sortedDraggables.length; j++) {
        const other = sortedDraggables[j];

        if (collides(current, other, fudge)) {
          // if the next node collides too, include it
          // to deal with inserting between two closely
          // positioned nodes
          if (j + 1 < sortedDraggables.length) {
            const cascaded = sortedDraggables[j + 1];
            if (collides(other, cascaded, fudge)) {
              return [current, other, cascaded];
            }
          }

          if (
            !!changed.find((uuid: string) => other.uuid === uuid) &&
            !!!changed.find((uuid: string) => current.uuid === uuid)
          ) {
            return [other, current];
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
    bottom: newTop + (position.bottom! - position.top),
    right: position.right
  });
};

/**
 * Reflow positions to account for any collisions
 * @param positions
 */
export const reflow = (
  positions: CanvasPositions,
  fudge: number
): { positions: CanvasPositions; changed: string[] } => {
  let newPositions = positions;
  const changed: string[] = [];

  // if for some reason we can't reflow, don't blow up
  let attempts = 0;

  timeStart('reflow');

  let collision = getFirstCollision(positions, changed, fudge);
  while (collision.length > 0 && attempts < MAX_REFLOW_ATTEMPTS) {
    attempts++;
    if (collision.length) {
      const [top, bottom, cascade] = collision;
      newPositions = mutate(newPositions, {
        [bottom.uuid]: set(setTop(bottom, top.bottom! + NODE_SPACING))
      });
      changed.push(bottom.uuid);

      if (cascade) {
        // start with the top of the bottom node
        let cascadeTop = top.bottom! + NODE_SPACING;

        // and add its height
        cascadeTop += bottom.bottom! - bottom.top;
        newPositions = mutate(newPositions, {
          [cascade.uuid]: set(setTop(cascade, cascadeTop))
        });

        changed.push(cascade.uuid);
      }
    }

    collision = getFirstCollision(newPositions, changed, fudge);
  }

  timeEnd('reflow');

  return { positions: newPositions, changed };
};
