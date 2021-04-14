import { Group } from 'flowTypes';
import { Asset, AssetType } from 'store/flowContext';
import { FormState } from 'store/nodeEditor';

export const labelSpecId = 'label';

export interface ChangeGroupsFormState extends FormState {
  groups: any;
  removeAll?: boolean;
}

export const excludeDynamicGroups = (group: any): boolean => {
  return !!group.query;
};

export const mapGroupsToAssets = (groups: Group[]): Asset[] => {
  return groups.map(({ name, uuid, name_match }) => {
    if (name_match) {
      return { name: name_match, id: name_match, type: AssetType.NameMatch };
    }
    return { name, id: uuid, type: AssetType.Group };
  });
};

export const mapAssetsToGroups = (searchResults: Asset[] | null): Group[] => {
  if (!searchResults) {
    return [];
  }

  const groups = searchResults.map(result => {
    if (!result.id || result.id === result.name) {
      return {
        name_match: result.name
      };
    }
    return {
      uuid: result.id,
      name: result.name
    };
  });

  return groups;
};
