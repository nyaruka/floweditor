import { FormHelper, Types } from '../../../config/typeConfigs';
import { ChangeGroups } from '../../../flowTypes';
import { ChangeGroupsFormState } from '../../../store/nodeEditor';
import { mapAssetsToGroups, mapGroupsToAssets } from './helpers';

export class RemoveGroupsFormHelper implements FormHelper {
    public actionToState(action: ChangeGroups): ChangeGroupsFormState {
        if (action) {
            return {
                type: action.type,
                groups: { value: mapGroupsToAssets(action.groups) },
                valid: true
            };
        }

        return {
            type: Types.remove_contact_groups,
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
