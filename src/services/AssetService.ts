// tslint:disable:max-classes-per-file
import { v4 as generateUUID } from 'uuid';
import { Endpoints, FlowEditorConfig, ContactProperties, Group } from '../flowTypes';
import axios, { AxiosResponse } from 'axios';
import { FlowComponents } from '../store/helpers';
import { dump } from '../utils';

export enum AssetType {
    Channel = 'channel',
    Flow = 'flow',
    Group = 'group',
    Property = 'property',
    Field = 'field'
}

export interface Asset {
    id: string;
    name: string;
    type: AssetType;

    isNew?: boolean;
    content?: any;
}

enum IdProperty {
    UUID = 'uuid',
    Key = 'key',
    ID = 'id'
}

enum NameProperty {
    Name = 'name'
}

enum SimAssetType {
    Flow = 'flow',
    Fields = 'field_set',
    Groups = 'group_set',
    Channels = 'channel_set'
}

interface SimAsset {
    type: SimAssetType;
    url: string;
    content: any;
}

export const getBaseURL = (): string => {
    const location = window.location;
    return (
        location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
    );
};

export class Assets {
    public endpoint: string;
    private localStorage: boolean;
    protected idProperty: IdProperty;
    protected assetType: AssetType;
    protected assets: { [id: string]: Asset } = {};

    constructor(endpoint: string, localStorage: boolean) {
        this.localStorage = localStorage;
        this.endpoint = endpoint;
        this.idProperty = IdProperty.UUID;
    }

    public get(id: string): Promise<Asset> {
        const existing = this.assets[id];
        if (existing) {
            return new Promise<Asset>(resolve => {
                resolve(existing);
            });
        }

        return new Promise<Asset>((resolve, reject) => {
            const url = `${this.endpoint}?uuid=${id}`;
            axios
                .get(url)
                .then((response: AxiosResponse) => {
                    const ob = response.data.results[0];
                    const asset = {
                        id: ob.uuid,
                        name: ob.name,
                        type: this.assetType,
                        content: ob.definition
                    };
                    if (this.localStorage) {
                        this.assets[id] = asset;
                    }
                    return resolve(asset);
                })
                .catch(error => reject(error));
        });
    }

    private searchLocalItems(term: string): Asset[] {
        // search our local items first
        const matches: Asset[] = [];
        Object.keys(this.assets).map((key: string) => {
            const asset = this.assets[key];
            if (this.matches(term, asset.name)) {
                matches.push(asset);
            }
        });
        return matches;
    }

    public search(term: string): Promise<Asset[]> {
        const matches = this.searchLocalItems(term);

        // then query against our endpoint to add to that list
        let url = this.endpoint;
        if (term) {
            url += '?query=' + encodeURIComponent(term);
        }

        return axios.get(url).then((response: AxiosResponse) => {
            for (const result of response.data.results) {
                if (this.matches(term, result.name)) {
                    matches.push({
                        name: result.name,
                        id: result[this.idProperty],
                        type: this.assetType
                    });
                }
            }
            return matches;
        });
    }

    public matches(query: string, check: string): boolean {
        if (!check) {
            return false;
        }

        if (query.length === 0) {
            return true;
        }

        return (
            check
                .toLocaleLowerCase()
                .trim()
                .indexOf(query.toLocaleLowerCase().trim()) > -1
        );
    }

    public add(result: Asset): void {
        if (this.localStorage) {
            this.assets[result.id] = result;
        }
    }

    public addAll(results: Asset[]): void {
        results.map((result: Asset) => {
            this.add(result);
        });
    }

    public update(uuid: string, content: any): Promise<Asset> {
        const result = new Promise<Asset>((resolve, reject) => {
            if (this.localStorage) {
                const asset = this.assets[uuid];
                asset.content = content;
                resolve(asset);
            } else {
                const url = `${this.endpoint}?uuid=${uuid}`;
                axios
                    .post(url, content)
                    .then((response: AxiosResponse) => {
                        const ob = response.data.results[0];
                        const asset = {
                            id: ob.uuid,
                            name: ob.name,
                            type: this.assetType,
                            content: ob.definition
                        };
                        if (this.localStorage) {
                            this.assets[uuid] = asset;
                        }
                        return resolve(asset);
                    })
                    .catch(error => reject(error));
            }
        });

        return result;
    }

    public getAssetSet(): any[] {
        const assets: any[] = [];
        Object.keys(this.assets).map((key: string) => {
            const asset = this.assets[key];
            if (asset.type !== AssetType.Property) {
                assets.push({
                    [this.idProperty]: asset.id,
                    name: asset.name,
                    ...asset.content
                });
            }
        });
        return assets;
    }

    public getAssetContents(type: SimAssetType): SimAsset[] {
        const assets: SimAsset[] = [];
        Object.keys(this.assets).map((key: string) => {
            const asset = this.assets[key];
            assets.push({
                type,
                url: getBaseURL() + this.endpoint + '/' + asset.id + '/',
                content: asset.content
            });
        });

        return assets;
    }
}

class GroupAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.idProperty = IdProperty.UUID;
        this.assetType = AssetType.Group;
    }
}

class FieldAssets extends Assets {
    public static CONTACT_PROPERTIES: Asset[] = [
        {
            name: ContactProperties.Name,
            id: ContactProperties.Name.toLowerCase(),
            type: AssetType.Property
        }
        /*{ 
            name: ContactProperties.Language, 
            id: ContactProperties.Language.toLowerCase(), 
            type: AttributeType.property 
        }*/
    ];

    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.idProperty = IdProperty.Key;
        this.assetType = AssetType.Field;

        FieldAssets.CONTACT_PROPERTIES.map((result: Asset) => {
            this.assets[result.id] = result;
        });
    }
}

class ChannelAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.idProperty = IdProperty.UUID;
        this.assetType = AssetType.Channel;

        const uuid = '6934255e-446b-40d3-b2ca-c5f801bd2278';
        this.assets[uuid] = {
            id: uuid,
            name: 'Simulator',
            type: AssetType.Channel,
            content: {
                address: '+12065550000',
                schemes: ['tel'],
                roles: ['send', 'receive']
            }
        };
    }
}

class FlowAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.idProperty = IdProperty.UUID;
        this.assetType = AssetType.Flow;
    }
}

export default class AssetService {
    private channels: Assets;
    private groups: Assets;
    private fields: Assets;
    private flows: FlowAssets;

    constructor(config: FlowEditorConfig) {
        this.groups = new GroupAssets(config.endpoints.groups, config.localStorage);
        this.fields = new FieldAssets(config.endpoints.fields, config.localStorage);
        this.flows = new FlowAssets(config.endpoints.flows, config.localStorage);

        // channels are always mocked for local
        this.channels = new ChannelAssets('/channels', true);
    }

    public addFlowComponents(flowComponents: FlowComponents): void {
        this.groups.addAll(flowComponents.groups);
        this.fields.addAll(flowComponents.fields);
    }

    public getFlowAssets(): Assets {
        return this.flows;
    }

    public getGroupAssets(): Assets {
        return this.groups;
    }

    public getFieldAssets(): Assets {
        return this.fields;
    }

    public getSimulationAssets(): any {
        let simAssets: SimAsset[] = [];
        const base = getBaseURL();
        // our group set asset
        simAssets.push({
            type: SimAssetType.Groups,
            url: base + this.groups.endpoint + '/',
            content: this.groups.getAssetSet()
        });

        // our fields
        simAssets.push({
            type: SimAssetType.Fields,
            url: base + this.fields.endpoint + '/',
            content: this.fields.getAssetSet()
        });

        // our channels
        simAssets.push({
            type: SimAssetType.Channels,
            url: base + this.channels.endpoint + '/',
            content: this.channels.getAssetSet()
        });

        // our flows
        simAssets = simAssets.concat(this.flows.getAssetContents(SimAssetType.Flow));

        const payload = {
            assets: simAssets,
            asset_server: {
                type_urls: {
                    flow: base + this.flows.endpoint + '/{uuid}/',
                    field_set: base + this.fields.endpoint + '/',
                    channel_set: base + this.channels.endpoint + '/',
                    group_set: base + this.groups.endpoint + '/'
                }
            }
        };

        return payload;
    }
}
