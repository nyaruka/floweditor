import {
    ChangeGroupsFormState,
    mapAssetsToGroups,
    mapGroupsToAssets
} from '~/components/flow/actions/changegroups/helpers';
import { getActionUUID } from '~/components/flow/actions/helpers';
import { Types } from '~/config/interfaces';
import { ChangeGroups } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

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

export const stateToAction = (
    nodeSettings: NodeEditorSettings,
    state: ChangeGroupsFormState
): ChangeGroups => {
    return {
        type: Types.add_contact_groups,
        groups: mapAssetsToGroups(state.groups.value),
        uuid: getActionUUID(nodeSettings, Types.add_contact_groups)
    };
};
