import { RenderNode } from "store/flowContext";

export interface DragPoint {
  exitUUID: string;
  nodeUUID: string;
}

export const getDraggedFrom = (ghostNode: RenderNode): DragPoint => {
  if (ghostNode.ghost) {
    const exitUUIDs = Object.keys(ghostNode.inboundConnections);
    if (exitUUIDs.length > 0) {
      const exitUUID = exitUUIDs[0];
      const nodeUUID = ghostNode.inboundConnections[exitUUID];
      return { exitUUID, nodeUUID };
    }
  }
};
