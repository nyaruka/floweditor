import { Group, ChangeGroups } from '../../../flowTypes';
import { SearchResult } from '../../../store';

export const mapGroupsToSearchResults = (groups: Group[]) =>
    groups.map(({ name, uuid }) => ({ name, id: uuid }));

export const mapSearchResultsToGroups = (searchResults: SearchResult[]) =>
    searchResults.map(result => ({
        uuid: result.id,
        name: result.name
    }));

export const getGroups = (action: ChangeGroups): SearchResult[] => {
    if (action.groups == null) {
        return [];
    }

    if (action.groups.length && action.type !== 'add_contact_groups') {
        return mapGroupsToSearchResults(action.groups);
    }

    return [];
};
