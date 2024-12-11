import { Types } from 'config/interfaces';
import { getActionUUID } from '../helpers';
import { FormEntry, FormState, NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { SetWAGroupField } from 'flowTypes';

export interface UpdateGroupFormState extends FormState {
  type: Types;
  field: FormEntry;
  fieldValue: StringEntry;
}

export const initializeForm = (settings: NodeEditorSettings): UpdateGroupFormState => {
  const state: UpdateGroupFormState = {
    type: Types.set_wa_group_field,
    valid: false,
    field: { value: null },
    fieldValue: { value: '' }
  };

  if (settings.originalAction) {
    state.type = Types.set_wa_group_field;
    const fieldAction = settings.originalAction as SetWAGroupField;
    if (fieldAction.field) {
      state.field = { value: { key: fieldAction.field.key, label: fieldAction.field.name } };
      state.valid = true;
    }
    state.fieldValue = { value: fieldAction.value };
    return state;
  }

  // default is updating name
  return state;
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: UpdateGroupFormState
): SetWAGroupField => {
  /* istanbul ignore else */
  const field = state.field.value;
  return {
    uuid: getActionUUID(settings, Types.set_wa_group_field),
    type: Types.set_wa_group_field,
    field: { name: field.label, key: field.key },
    value: state.fieldValue.value
  };
};

export const getName = (asset: any): string => {
  return asset.label || asset.name || asset.key;
};
