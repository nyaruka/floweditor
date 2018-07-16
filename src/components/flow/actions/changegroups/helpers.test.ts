import { FlowDefinition, ChangeGroups } from '~/flowTypes';
import {
    mapGroupsToAssets,
    mapAssetsToGroups
} from '~/components/flow/actions/changegroups/helpers';

const definition: FlowDefinition = require('~/test/assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const { assets: groups } = require('~/test/assets/groups.json');

const {
    nodes: [node],
    language: flowLanguage
} = definition;
const {
    actions: [, addToGroupsAction]
} = node;

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
