import { Group } from '../../../flowTypes';
import { SearchResult } from '../../../store';

export const mapGroupsToSearchResults = (groups: Group[]) =>
    groups.map(({ name, uuid }) => ({ name, id: uuid }));

export const mapSearchResultsToGroups = (searchResults: SearchResult[]) =>
    searchResults.map(result => ({
        uuid: result.id,
        name: result.name
    }));
