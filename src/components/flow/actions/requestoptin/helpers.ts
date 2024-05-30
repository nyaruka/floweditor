import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { RequestOptIn } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';
import { RequestOptInFormState } from './RequestOptInForm';

export const initializeForm = (settings: NodeEditorSettings): RequestOptInFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.request_optin) {
    const action = settings.originalAction as RequestOptIn;
    return {
      optin: { value: action.optin },
      valid: true
    };
  }

  return {
    optin: { value: null },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  formState: RequestOptInFormState
): RequestOptIn => {
  const result = {
    type: Types.request_optin,
    optin: formState.optin.value[0],
    uuid: getActionUUID(settings, Types.add_input_labels)
  };
  return result;
};
