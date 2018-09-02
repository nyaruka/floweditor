import { Group } from '~/flowTypes';
import { Asset, AssetType } from '~/store/flowContext';
import { AssetArrayEntry, FormState } from '~/store/nodeEditor';

export const labelSpecId = 'label';

export interface ChangeGroupsFormState extends FormState {
    groups: AssetArrayEntry;
    removeAll?: boolean;
}

export const mapGroupsToAssets = (groups: Group[]): Asset[] =>
    groups.map(({ name, uuid }) => ({ name, id: uuid, type: AssetType.Group }));

export const mapAssetsToGroups = (searchResults: Asset[]): Group[] =>
    searchResults.map(result => ({
        uuid: result.id,
        name: result.name
    }));
