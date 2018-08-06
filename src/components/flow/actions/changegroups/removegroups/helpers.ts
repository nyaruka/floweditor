import {
    ChangeGroupsFormState,
    mapAssetsToGroups,
    mapGroupsToAssets
} from '~/components/flow/actions/changegroups/helpers';
import { getActionUUID } from '~/components/flow/actions/helpers';
import { Types } from '~/config/typeConfigs';
import { RemoveFromGroups } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): ChangeGroupsFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.remove_contact_groups) {
        const action = settings.originalAction as RemoveFromGroups;
        return {
            groups: { value: mapGroupsToAssets(action.groups) },
            removeAll: action.groups.length === 0 || action.all_groups,
            valid: true
        };
    }

    return {
        groups: { value: null },
        removeAll: false,
        valid: false
    };
};

export const stateToAction = (
    settings: NodeEditorSettings,
    state: ChangeGroupsFormState
): RemoveFromGroups => {
    return {
        type: Types.remove_contact_groups,
        groups: state.removeAll ? [] : mapAssetsToGroups(state.groups.value),
        all_groups: !!state.removeAll,
        uuid: getActionUUID(settings, Types.remove_contact_groups)
    };
};
