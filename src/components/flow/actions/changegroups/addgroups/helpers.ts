import { ChangeGroupsFormState } from 'components/flow/actions/changegroups/helpers';
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { ChangeGroups, Group } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): ChangeGroupsFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.add_contact_groups) {
    const action = settings.originalAction as ChangeGroups;
    return {
      groups: {
        value: action.groups.map((group: Group) => {
          if (group.name_match) {
            return { name: group.name_match, expression: true };
          }
          return group;
        })
      },
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
    groups: state.groups.value.map((group: any) => {
      if (group.expression) {
        return { name_match: group.name };
      }
      return group;
    }),
    uuid: getActionUUID(nodeSettings, Types.add_contact_groups)
  };
};
