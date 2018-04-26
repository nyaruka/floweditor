import { Group, ChangeGroups } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';

export const mapGroupsToAssets = (groups: Group[]): Asset[] =>
    groups.map(({ name, uuid }) => ({ name, id: uuid, type: AssetType.Group }));

export const mapAssetsToGroups = (searchResults: Asset[]): Group[] =>
    searchResults.map(result => ({
        uuid: result.id,
        name: result.name
    }));
