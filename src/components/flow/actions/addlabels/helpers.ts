import { AddLabelsFormState } from 'components/flow/actions/addlabels/AddLabelsForm';
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { AddLabels, Label } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): AddLabelsFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.add_input_labels) {
    const action = settings.originalAction as AddLabels;
    return {
      labels: {
        value: action.labels.map((label: Label) => {
          if (label.name_match) {
            return { name: label.name_match, expression: true };
          }
          return label;
        })
      },
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
  const result = {
    type: Types.add_input_labels,
    labels: formState.labels.value.map((label: any) => {
      if (label.expression) {
        return { name_match: label.name };
      }
      return label;
    }),
    uuid: getActionUUID(settings, Types.add_input_labels)
  };
  return result;
};
