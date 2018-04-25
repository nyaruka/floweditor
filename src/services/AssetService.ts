import { SearchResult } from '../store';
import { Endpoints, FlowEditorConfig } from '../flowTypes';
import axios, { AxiosResponse } from 'axios';
import { FlowComponents } from '../store/helpers';

export interface GroupAsset {
    uuid: string;
    name: string;
}

export class Assets {
    private items: SearchResult[] = [];
    private endpoint: string;
    private localStorage: boolean;
    private nameProperty: string;
    private idProperty: string;

    constructor(endpoint: string, localStorage: boolean, nameProperty: string, idProperty: string) {
        this.localStorage = localStorage;
        this.endpoint = endpoint;
        this.nameProperty = nameProperty;
        this.idProperty = idProperty;
    }

    public search(term: string): Promise<SearchResult[]> {
        let matches: SearchResult[] = [];

        // if we have local storage, search there
        if (this.localStorage) {
            matches = this.items.filter((result: SearchResult) => this.matches(term, result.name));
        }

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

export default class AssetService {
    private groups: Assets;
    private fields: Assets;

    constructor(config: FlowEditorConfig) {
        this.groups = new Assets(config.endpoints.groups, config.localStorage, 'name', 'uuid');
        this.fields = new Assets(config.endpoints.fields, config.localStorage, 'label', 'key');
    }

    public addFlowComponents(flowComponents: FlowComponents): void {
        this.groups.addAll(flowComponents.groups);
        this.fields.addAll(flowComponents.fields);
    }

    public getGroupAssets(): Assets {
        return this.groups;
    }

    public getFieldAssets(): Assets {
        return this.fields;
    }
}
