import {
  CHANNEL_PROPERTY,
  LANGUAGE_PROPERTY,
  NAME_PROPERTY,
  STATUS_PROPERTY
} from 'components/flow/props';
import { isOnlineFlowType } from 'config/helpers';
import { FlowTypes } from 'config/interfaces';
import { Asset, RenderNode } from 'store/flowContext';

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

const ONLINE_PROPERTIES: Asset[] = [
  NAME_PROPERTY,
  LANGUAGE_PROPERTY,
  CHANNEL_PROPERTY,
  STATUS_PROPERTY
];
const OFFLINE_PROPERTIES: Asset[] = [NAME_PROPERTY, LANGUAGE_PROPERTY, STATUS_PROPERTY];

export const getContactProperties = (flowType: FlowTypes = null): Asset[] => {
  return !flowType || isOnlineFlowType(flowType) ? ONLINE_PROPERTIES : OFFLINE_PROPERTIES;
};
