import { AddLabelsFormState } from 'components/flow/actions/addlabels/AddLabelsForm';
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { AddLabels } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): AddLabelsFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.add_input_labels) {
    const action = settings.originalAction as AddLabels;
    return {
      labels: { value: action.labels },
      valid: true
    };
  }

  return {
    labels: { value: [] },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  formState: AddLabelsFormState
): AddLabels => {
  return {
    type: Types.add_input_labels,
    labels: formState.labels.value,
    uuid: getActionUUID(settings, Types.add_input_labels)
  };
};
