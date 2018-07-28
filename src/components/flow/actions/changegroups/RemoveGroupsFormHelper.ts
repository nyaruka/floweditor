import {
    mapAssetsToGroups,
    mapGroupsToAssets
} from '~/components/flow/actions/changegroups/helpers';
import { FormHelper, Types } from '~/config/typeConfigs';
import { ChangeGroups } from '~/flowTypes';
import { ChangeGroupsFormState, NodeEditorSettings } from '~/store/nodeEditor';

export class RemoveGroupsFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): ChangeGroupsFormState {
        if (
            settings.originalAction &&
            settings.originalAction.type === Types.remove_contact_groups
        ) {
            const action = settings.originalAction as ChangeGroups;
            return {
                groups: { value: mapGroupsToAssets(action.groups) },
                removeAll: action.groups.length === 0,
                valid: true
            };
        }

        return {
            groups: { value: null },
            valid: false
        };
    }

    public stateToAction(uuid: string, state: ChangeGroupsFormState): ChangeGroups {
        return {
            type: Types.remove_contact_groups,
            groups: state.removeAll ? [] : mapAssetsToGroups(state.groups.value),
            uuid
        };
    }
}
