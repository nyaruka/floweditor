import { SearchResult } from '../store';

export interface GroupAsset {
    uuid: string;
    name: string;
}

export interface Assets {
    search(term: string): SearchResult[];
    add(searchResult: SearchResult): void;
    addAll(searchResults: SearchResult[]): void;
}

export class GroupAssets {
    private groups: SearchResult[] = [];

    public search(term: string): SearchResult[] {
        const termLowered = term.toLowerCase().trim();
        return this.groups.filter((result: SearchResult) => result.match.indexOf(termLowered) > -1);
    }

    public add(result: SearchResult): void {
        result.match = result.name.toLowerCase().trim();
        if (this.search(result.match).length === 0) {
            delete result.extraResult;
            this.groups.push(result);
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

    constructor() {
        this.groups = new GroupAssets();
    }

    public getGroups(): Assets {
        return this.groups;
    }
}
