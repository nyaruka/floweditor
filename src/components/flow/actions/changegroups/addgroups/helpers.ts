import { Types } from '~/config/typeConfigs';
import { ChangeGroups } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

import { ChangeGroupsFormState, mapAssetsToGroups, mapGroupsToAssets } from '../helpers';

export const initializeForm = (settings: NodeEditorSettings): ChangeGroupsFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.add_contact_groups) {
        const action = settings.originalAction as ChangeGroups;
        return {
            groups: { value: mapGroupsToAssets(action.groups) },
            valid: true
        };
    }

    return {
        groups: { value: null },
        valid: false
    };
};

export const stateToAction = (uuid: string, state: ChangeGroupsFormState): ChangeGroups => {
    return {
        type: Types.add_contact_groups,
        groups: mapAssetsToGroups(state.groups.value),
        uuid
    };
};
