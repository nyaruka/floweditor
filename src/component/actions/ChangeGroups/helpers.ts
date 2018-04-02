import { Group, ChangeGroups } from '../../../flowTypes';
import { SearchResult } from '../../../store';

export const mapGroupsToSearchResults = (groups: Group[]): SearchResult[] =>
    groups.map(({ name, uuid }) => ({ name, id: uuid }));

export const mapSearchResultsToGroups = (searchResults: SearchResult[]): Group[] =>
    searchResults.map(result => ({
        uuid: result.id,
        name: result.name
    }));
