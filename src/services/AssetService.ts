// tslint:disable:max-classes-per-file
import axios, { AxiosResponse } from 'axios';
import { v4 as generateUUID } from 'uuid';
import { FlowEditorConfig } from '~/flowTypes';
import { FlowComponents } from '~/store/helpers';

export enum AssetType {
    Channel = 'channel',
    Flow = 'flow',
    Group = 'group',
    Field = 'field',
    Contact = 'contact',
    URN = 'urn',
    Label = 'label',
    Language = 'language',
    Environment = 'environment',
    Remove = 'remove',
    ContactProperty = 'property'
}

export const DEFAULT_LANGUAGE = { id: '', name: 'Default', type: AssetType.Language };

export interface Asset {
    id: string;
    name: string;
    type: AssetType;

    isNew?: boolean;
    content?: any;
}

export interface AssetSearchResult {
    assets: Asset[];
    complete: boolean;
    sorted: boolean;
}

enum IdProperty {
    UUID = 'uuid',
    Key = 'key',
    ID = 'id',
    Iso = 'iso'
}

enum NameProperty {
    Name = 'name'
}

enum SimAssetType {
    Flow = 'flow',
    Fields = 'field',
    Groups = 'group',
    Channels = 'channel',
    Labels = 'label'
}

interface SimAsset {
    type: SimAssetType;
    url: string;
    content: any;
}

export const removeAsset = { id: AssetType.Remove, name: 'Remove Value', type: AssetType.Remove };

export const getBaseURL = (): string => {
    const location = window.location;
    return (
        location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
    );
};

export const getURL = (path: string): string => {
    let url = path;
    if (!url.endsWith('/')) {
        url += '/';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Set url for netlify deployments
    if (process.env.NODE_ENV === 'preview') {
        url = '/.netlify/functions/' + url;
    }

    return `${getBaseURL() + url}`;
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
            const url = `${this.endpoint}${id ? `/${id}/` : ''}`;
            axios
                .get(url)
                .then((response: AxiosResponse) => {
                    const ob = response.data;
                    const uuid = ob.uuid || generateUUID();
                    const name = ob.name || '';
                    const asset = {
                        id: uuid,
                        name,
                        type: this.assetType,
                        content: ob
                    };
                    if (this.localStorage) {
                        this.assets[id] = asset;
                    }
                    return resolve(asset);
                })
                .catch(error => reject(error));
        });
    }

    protected searchLocalItems(term: string): Asset[] {
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

    public search(term: string): Promise<AssetSearchResult> {
        const matches = this.searchLocalItems(term);

        // then query against our endpoint to add to that list
        let url = this.endpoint;
        if (term) {
            url += '?query=' + encodeURIComponent(term);
        }

        return axios.get(url).then((response: AxiosResponse) => {
            // Only attempt to match if response contains a list of externally-fetched assets
            if (Array.isArray(response.data)) {
                for (const result of response.data) {
                    if (this.matches(term, result.name)) {
                        matches.push({
                            name: result.name,
                            id: result[this.idProperty],
                            type: this.assetType
                        });
                    }
                }
            } else {
                // Right now this just covers the mocked 'environment' response
                // in 'environment.json'.
                const { data: result } = response;
                matches.push({
                    name: result.name,
                    id: result[this.idProperty],
                    type: this.assetType
                });
            }

            return { assets: matches, complete: true, sorted: false };
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
                const url = `${this.endpoint}/${uuid}/`;
                /*
                axios
                    .post(url, content)
                    .then((response: AxiosResponse) => {
                        const ob = response.data;
                        const asset = {
                            id: ob.uuid,
                            name: ob.name,
                            type: this.assetType,
                            content: ob
                        };
                        if (this.localStorage) {
                            this.assets[uuid] = asset;
                        }
                        return resolve(asset);
                    })
                    .catch(error => reject(error));
                */
                this.assets[uuid].content = content;
                resolve(this.assets[uuid]);
            }
        });

        return result;
    }

    public getAssetSet(): any[] {
        const assets: any[] = [];
        Object.keys(this.assets).forEach((key: string) => {
            const asset = this.assets[key];
            assets.push({
                [this.idProperty]: asset.id,
                name: asset.name,
                ...asset.content
            });
        });
        return assets;
    }

    public getAssetContents(type: SimAssetType): SimAsset[] {
        return Object.keys(this.assets).map((key: string) => {
            const asset = this.assets[key];
            return {
                type,
                url: getURL(this.endpoint + '/' + asset.id + '/'),
                content: asset.content
            };
        });
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
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);

        this.idProperty = IdProperty.Key;
        this.assetType = AssetType.Field;
    }
}

export class ChannelAssets extends Assets {
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

    public search(term: string): Promise<AssetSearchResult> {
        // make sure the simulator channel isn't included
        const matches: Asset[] = [];

        // then query against our endpoint to add to that list
        let url = this.endpoint;
        if (term) {
            url += '?query=' + encodeURIComponent(term);
        }

        return axios.get(url).then((response: AxiosResponse) => {
            for (const result of response.data) {
                if (this.matches(term, result.name)) {
                    matches.push({
                        name: result.name,
                        id: result[this.idProperty],
                        type: this.assetType
                    });
                }
            }
            return { assets: matches, complete: true, sorted: false };
        });
    }
}

export class FlowAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.idProperty = IdProperty.UUID;
        this.assetType = AssetType.Flow;
    }
}

class RecipientAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.idProperty = IdProperty.UUID;
    }

    private getAssetType(code: string): AssetType {
        switch (code) {
            case 'c':
                return AssetType.Contact;
            case 'u':
                return AssetType.URN;
            case 'g':
                return AssetType.Group;
        }
        return null;
    }

    public search(term: string): Promise<AssetSearchResult> {
        const matches: Asset[] = [];

        // then query against our endpoint to add to that list
        let url = this.endpoint + '?types=cg';
        if (term) {
            url += '&search=' + encodeURIComponent(term);
        }

        return axios.get(url).then((response: AxiosResponse) => {
            for (const result of response.data.results) {
                if (this.matches(term, result.text)) {
                    const [typeCode, id] = result.id.split(/-(.*)/);
                    const type = this.getAssetType(typeCode);
                    if (type) {
                        let content: any = null;
                        if (type === AssetType.URN) {
                            content = {
                                scheme: result.scheme,
                                display: result.extra
                            };
                        } else if (type === AssetType.Group) {
                            content = {
                                size: result.extra
                            };
                        }
                        matches.push({ name: result.text, id, type, content });
                    }
                }
            }
            return { assets: matches, complete: response.data.more, sorted: true };
        });
    }
}

export class LabelAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);

        this.idProperty = IdProperty.UUID;
        this.assetType = AssetType.Label;
    }
}

export class LanguageAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);

        this.idProperty = IdProperty.Iso;
        this.assetType = AssetType.Language;
    }
}

export class EnvironmentAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);

        this.idProperty = IdProperty.ID;
        this.assetType = AssetType.Environment;
    }
}

export default class AssetService {
    private channels: ChannelAssets;
    private channelsURL: string;
    private groups: GroupAssets;
    private groupsURL: string;
    private fields: FieldAssets;
    private fieldsURL: string;
    private flows: FlowAssets;
    private recipients: RecipientAssets;
    private flowsURL: string;
    private labels: FieldAssets;
    private labelsURL: string;
    private environment: EnvironmentAssets;
    private environmentURL: string;
    private languages: LanguageAssets;
    private languagesURL: string;

    constructor(config: FlowEditorConfig) {
        // initialize asset deps
        this.groups = new GroupAssets(config.endpoints.groups, config.localStorage);
        this.fields = new FieldAssets(config.endpoints.fields, config.localStorage);
        this.flows = new FlowAssets(config.endpoints.flows, config.localStorage);
        this.recipients = new RecipientAssets(config.endpoints.recipients, config.localStorage);
        this.labels = new LabelAssets(config.endpoints.labels, config.localStorage);
        this.channels = new ChannelAssets(config.endpoints.channels, config.localStorage);
        this.environment = new EnvironmentAssets(config.endpoints.environment, config.localStorage);
        this.languages = new LanguageAssets(config.endpoints.languages, config.localStorage);

        // initialize asset urls
        this.groupsURL = getURL(this.groups.endpoint);
        this.fieldsURL = getURL(this.fields.endpoint);
        this.labelsURL = getURL(this.labels.endpoint);
        this.flowsURL = getURL(this.flows.endpoint);
        this.channelsURL = getURL(this.channels.endpoint);
        this.environmentURL = getURL(this.environment.endpoint);
        this.languagesURL = getURL(this.languages.endpoint);
    }

    public addFlowComponents(flowComponents: FlowComponents): void {
        this.groups.addAll(flowComponents.groups);
        this.fields.addAll(flowComponents.fields);
        this.labels.addAll(flowComponents.labels);
    }

    public getFlowAssets(): FlowAssets {
        return this.flows;
    }

    public getGroupAssets(): GroupAssets {
        return this.groups;
    }

    public getFieldAssets(): FieldAssets {
        return this.fields;
    }

    public getRecipients(): RecipientAssets {
        return this.recipients;
    }

    public getLabelAssets(): LabelAssets {
        return this.labels;
    }

    public getChannelAssets(): ChannelAssets {
        return this.channels;
    }

    public getEnvironmentAssets(): EnvironmentAssets {
        return this.environment;
    }

    public getLanguageAssets(): LanguageAssets {
        return this.languages;
    }

    public getSimulationAssets(): any {
        const simAssets: SimAsset[] = [];

        // our group set asset
        simAssets.push({
            type: SimAssetType.Groups,
            url: this.groupsURL,
            content: this.groups.getAssetSet()
        });

        // our fields
        simAssets.push({
            type: SimAssetType.Fields,
            url: this.fieldsURL,
            content: this.fields.getAssetSet()
        });

        // our labels
        simAssets.push({
            type: SimAssetType.Labels,
            url: this.labelsURL,
            content: this.labels.getAssetSet()
        });

        // our channels
        simAssets.push({
            type: SimAssetType.Channels,
            url: this.channelsURL,
            content: this.channels.getAssetSet()
        });

        // our flows
        simAssets.push(...this.flows.getAssetContents(SimAssetType.Flow));

        const payload = {
            assets: simAssets,
            asset_server: {
                type_urls: {
                    [SimAssetType.Flow]: this.flowsURL,
                    [SimAssetType.Fields]: this.fieldsURL,
                    [SimAssetType.Channels]: this.channelsURL,
                    [SimAssetType.Groups]: this.groupsURL,
                    [SimAssetType.Labels]: this.labelsURL
                }
            }
        };

        return payload;
    }
}
