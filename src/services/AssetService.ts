// tslint:disable:max-classes-per-file
import { SearchResult } from '../store';
import { Endpoints, FlowEditorConfig, ContactProperties, AttributeType } from '../flowTypes';
import axios, { AxiosResponse } from 'axios';
import { FlowComponents } from '../store/helpers';

export class Assets {
    private endpoint: string;
    private localStorage: boolean;
    protected nameProperty: string;
    protected idProperty: string;

    // TODO: consider redux backed by local storage for this
    protected items: SearchResult[] = [];
    protected objects = {};

    constructor(endpoint: string, localStorage: boolean) {
        this.localStorage = localStorage;
        this.endpoint = endpoint;
        this.nameProperty = 'name';
        this.idProperty = 'uuid';
    }

    public get(uuid: string): Promise<any> {
        const existing = this.objects[uuid];
        if (existing) {
            return new Promise<any>(resolve => {
                resolve(existing);
            });
        }

        return new Promise<any>((resolve, reject) => {
            const url = `${this.endpoint}?uuid=${uuid}`;
            axios
                .get(url)
                .then((response: AxiosResponse) => {
                    const ob = response.data.results[0];
                    if (this.localStorage) {
                        this.objects[uuid] = ob;
                    }
                    return resolve(ob);
                })
                .catch(error => reject(error));
        });
    }

    public search(term: string): Promise<SearchResult[]> {
        // search our local items first
        const matches: SearchResult[] = this.items.filter((result: SearchResult) => {
            return this.matches(term, result.name);
        });

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
                        id: result[this.idProperty]
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

    public add(result: SearchResult): void {
        if (this.localStorage) {
            const exists = this.items.filter((existing: SearchResult) =>
                this.matches(existing.name, result.name)
            );

            if (exists.length === 0) {
                this.items.push(result);
            }
        }
    }

    public addAll(results: SearchResult[]): void {
        results.map((result: SearchResult) => {
            this.add(result);
        });
    }
}

class GroupAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.nameProperty = 'name';
        this.idProperty = 'uuid';
    }
}

class FieldAssets extends Assets {
    public static CONTACT_PROPERTIES: SearchResult[] = [
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

        FieldAssets.CONTACT_PROPERTIES.map((result: SearchResult) => {
            this.items.push(result);
        });
    }
}

class FlowAssets extends Assets {
    constructor(endpoint: string, localStorage: boolean) {
        super(endpoint, localStorage);
        this.nameProperty = 'name';
        this.idProperty = 'uuid';
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
