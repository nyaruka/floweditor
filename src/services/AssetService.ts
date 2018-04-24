import { SearchResult } from '../store';
import { Endpoints } from '../flowTypes';
import axios, { AxiosResponse } from 'axios';
import { FlowComponents } from '../store/helpers';

export interface GroupAsset {
    uuid: string;
    name: string;
}

export class Assets {
    private items: SearchResult[] = [];
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
        axios.get(endpoint).then((response: AxiosResponse) => {
            for (const result of response.data.results) {
                this.add({ name: result.name, id: result.uuid });
            }
        });
    }

    public search(term: string): SearchResult[] {
        const termLowered = term.toLowerCase().trim();
        return this.items.filter((result: SearchResult) => result.match.indexOf(termLowered) > -1);
    }

    public add(result: SearchResult): void {
        result.match = result.name.toLowerCase().trim();
        if (this.search(result.match).length === 0) {
            delete result.extraResult;
            this.items.push(result);
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

    constructor(endpoints: Endpoints) {
        this.groups = new Assets(endpoints.groups);
    }

    public addFlowComponents(flowComponents: FlowComponents): void {
        this.groups.addAll(flowComponents.groups);
    }

    public getGroupAssets(): Assets {
        return this.groups;
    }
}
