// tslint:disable:max-classes-per-file
import { Endpoints, FlowEditorConfig, ContactProperties, AttributeType } from '../flowTypes';
import axios, { AxiosResponse } from 'axios';
import { FlowComponents } from '../store/helpers';
import { dump } from '../utils';

export interface Asset {
    id: string;
    name: string;
    type: string;

    isNew?: boolean;
    content?: any;
}

export class Assets {
    private endpoint: string;
    private localStorage: boolean;
    protected nameProperty: string;
    protected idProperty: string;
    protected assetType: string;
    protected assets: { [id: string]: Asset } = {};

    constructor(endpoint: string, localStorage: boolean) {
        this.localStorage = localStorage;
        this.endpoint = endpoint;
        this.nameProperty = 'name';
        this.idProperty = 'uuid';
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
                if (this.matches(term, result[this.nameProperty])) {
                    matches.push({
                        name: result[this.nameProperty],
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
}

class GroupAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.nameProperty = 'name';
        this.idProperty = 'uuid';
        this.assetType = 'group';
    }
}

class FieldAssets extends Assets {
    public static CONTACT_PROPERTIES: Asset[] = [
        {
            name: ContactProperties.Name,
            id: ContactProperties.Name.toLowerCase(),
            type: AttributeType.property
        }
        /*{ 
            name: ContactProperties.Language, 
            id: ContactProperties.Language.toLowerCase(), 
            type: AttributeType.property 
        }*/
    ];

    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.nameProperty = 'label';
        this.idProperty = 'key';
        this.assetType = 'field';

        FieldAssets.CONTACT_PROPERTIES.map((result: Asset) => {
            this.assets[result.id] = result;
        });
    }
}

class FlowAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.nameProperty = 'name';
        this.idProperty = 'uuid';
        this.assetType = 'flow';
    }
}

export default class AssetService {
    private groups: Assets;
    private fields: Assets;
    private flows: FlowAssets;

    constructor(config: FlowEditorConfig) {
        this.groups = new GroupAssets(config.endpoints.groups, config.localStorage);
        this.fields = new FieldAssets(config.endpoints.fields, config.localStorage);
        this.flows = new FlowAssets(config.endpoints.flows, config.localStorage);
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
}
