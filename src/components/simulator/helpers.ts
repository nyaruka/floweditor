import { FlowDefinition } from '~/flowTypes';
import { AssetStore, AssetType } from '~/store/flowContext';
import { assetMapToList } from '~/store/helpers';
import { createUUID } from '~/utils';

const SIMULATOR_CHANNEL = {
    id: createUUID(),
    name: 'Simulator',
    type: AssetType.Channel,
    content: {
        address: '+12065550000',
        schemes: ['tel'],
        roles: ['send', 'receive']
    }
};
interface SimAsset {
    type: AssetType;
    url: string;
    content: any;
}

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
        url: assets.flows.endpoint + `/${flow.uuid}/`,
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
