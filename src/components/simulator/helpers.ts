import { EventProps } from 'components/simulator/LogEvent';
import { FlowDefinition } from 'flowTypes';
import { AssetStore, AssetType } from 'store/flowContext';
import { assetMapToList } from 'store/helpers';
import { createUUID } from 'utils';

export const DEFAULT_KEY = '__default__';

const SIMULATOR_CHANNEL = {
  uuid: createUUID(),
  name: 'Simulator',
  address: '+12065550000',
  schemes: ['tel'],
  roles: ['send', 'receive']
};

interface SimAsset {
  type: AssetType;
  url: string;
  content: any;
}

export const getTime = (): string => {
  const now = new Date();
  const mins = now.getMinutes();
  let minStr = '' + mins;
  if (mins < 10) {
    minStr = '0' + mins;
  }
  return Math.abs(12 - now.getHours()) + ':' + minStr;
};

export const getSimulationAssets = (assets: AssetStore, flow: FlowDefinition): any => {
  const simAssets: SimAsset[] = [];

  // our group set asset
  simAssets.push({
    type: AssetType.Group,
    url: assets.groups.endpoint,
    content: assetMapToList(assets.groups.items)
  });

  // our fields
  simAssets.push({
    type: AssetType.Field,
    url: assets.fields.endpoint,
    content: assetMapToList(assets.fields.items)
  });

  // our labels
  simAssets.push({
    type: AssetType.Label,
    url: assets.labels.endpoint,
    content: assetMapToList(assets.labels.items)
  });

  // our channels
  simAssets.push({
    type: AssetType.Channel,
    url: assets.channels.endpoint,
    content: [SIMULATOR_CHANNEL]
  });

  simAssets.push({
    type: AssetType.Flow,
    url: assets.flows.endpoint + `${flow.uuid}/`,
    content: flow
  });

  const payload = {
    assets: simAssets,
    asset_server: {
      type_urls: {
        [AssetType.Flow]: assets.flows.endpoint,
        [AssetType.Field]: assets.fields.endpoint,
        [AssetType.Channel]: assets.channels.endpoint,
        [AssetType.Group]: assets.groups.endpoint,
        [AssetType.Label]: assets.labels.endpoint
      }
    }
  };

  return payload;
};

export const isMessage = (event: EventProps): boolean => {
  return !!['msg_created', 'msg_received', 'ivr_created'].find(type => type === event.type);
};

export const isMT = (event: EventProps): boolean => {
  return !!['msg_created', 'ivr_created'].find(type => type === event.type);
};

export const hasPopulatedKey = (obj: any): boolean => {
  if (obj) {
    Object.keys(obj).forEach((key: string) => {
      return true;
    });
  }
  return false;
};

export const pruneEmpty = (obj: any): any => {
  if (typeof obj === 'object') {
    Object.keys(obj).forEach((key: string) => {
      if (
        !obj[key] ||
        (Object.keys(obj[key]).length === 1 && obj[key].hasOwnProperty(DEFAULT_KEY))
      ) {
        delete obj[key];
      } else {
        pruneEmpty(obj[key]);

        // now see if we have any new leaves
        if (obj[key] !== null && typeof obj[key] === 'object') {
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      }
    });
  }

  return obj;
};
