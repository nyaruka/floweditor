import { ChangeGroupsFormState } from 'components/flow/actions/changegroups/helpers';
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { RemoveFromGroups } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): ChangeGroupsFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.remove_contact_groups) {
    const action = settings.originalAction as RemoveFromGroups;

    const groups = action.groups || [];
    return {
      groups: { value: groups },
      removeAll: groups.length === 0 || action.all_groups,
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
    groups: state.removeAll
      ? []
      : state.groups.value.map((group: any) => {
          return { uuid: group.uuid, name: group.name };
        }),
    all_groups: !!state.removeAll,
    uuid: getActionUUID(settings, Types.remove_contact_groups)
  };
};
