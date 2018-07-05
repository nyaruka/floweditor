import { FormHelper, Types } from '~/config/typeConfigs';
import { ChangeGroups } from '~/flowTypes';
import { ChangeGroupsFormState, NodeEditorSettings } from '~/store/nodeEditor';
import { mapAssetsToGroups, mapGroupsToAssets } from './helpers';

export class AddGroupsFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): ChangeGroupsFormState {
        if (settings.originalAction) {
            const action = settings.originalAction as ChangeGroups;
            return {
                type: action.type,
                groups: { value: mapGroupsToAssets(action.groups) },
                valid: true
            };
        }

        return {
            type: Types.add_contact_groups,
            groups: { value: null },
            valid: false
        };
    }

    public stateToAction(uuid: string, state: ChangeGroupsFormState): ChangeGroups {
        return {
            type: state.type,
            groups: mapAssetsToGroups(state.groups.value),
            uuid
        };
    }
}
