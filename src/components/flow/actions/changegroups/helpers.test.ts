import {
    mapAssetsToGroups,
    mapGroupsToAssets
} from '~/components/flow/actions/changegroups/helpers';

const { assets: groups } = require('~/test/assets/groups.json');

describe('mapGroupsToSearchResults', () => {
    it('should return a list of SearchResult objects', () => {
        const searchResults = mapGroupsToAssets(groups);

        searchResults.forEach((searchResult, idx) => {
            expect(searchResult.name).toBe(groups[idx].name);
            expect(searchResult.id).toBe(groups[idx].uuid);
        });
        expect(searchResults).toMatchSnapshot();
    });
});

describe('mapSearchResultsToGroups', () => {
    it('should return a list of Group objects', () => {
        const searchResults = mapGroupsToAssets(groups);
        const groupList = mapAssetsToGroups(searchResults);

        groupList.forEach((group, idx) => {
            expect(group.uuid).toBe(searchResults[idx].id);
            expect(group.name).toBe(searchResults[idx].name);
        });
        expect(groupList).toMatchSnapshot();
    });
});
