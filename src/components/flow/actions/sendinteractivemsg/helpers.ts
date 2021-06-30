/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { SendInteractiveMsg } from 'flowTypes';
import { AssetStore } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';

import { SendInteractiveMsgFormState } from './SendInteractiveMsgForm';

export const initializeForm = (
  settings: NodeEditorSettings,
  assetStore: AssetStore
): SendInteractiveMsgFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_interactive_msg) {
    const action = settings.originalAction as SendInteractiveMsg;
    return {
      message: { value: action.text },
      valid: true
    };
  }

  return {
    message: { value: '' },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: SendInteractiveMsgFormState
): SendInteractiveMsg => {
  const result: SendInteractiveMsg = {
    text: state.message.value,
    type: Types.send_interactive_msg,
    uuid: getActionUUID(settings, Types.send_msg)
  };

  return result;
};
