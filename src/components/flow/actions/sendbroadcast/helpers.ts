import {
  getActionUUID,
  getExpressions,
  getRecipients,
  getRecipientsByAsset
} from 'components/flow/actions/helpers';
import { SendBroadcastFormState } from 'components/flow/actions/sendbroadcast/SendBroadcastForm';
import { Types } from 'config/interfaces';
import { BroadcastMsg, WithIssues } from 'flowTypes';
import { AssetType } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): SendBroadcastFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_broadcast) {
    let action = settings.originalAction as BroadcastMsg & WithIssues;

    // check if our form should use a localized action
    if (settings.localizations && settings.localizations.length > 0) {
      const localized = settings.localizations[0];
      if (localized.isLocalized()) {
        action = settings.localizations[0].getObject() as BroadcastMsg & WithIssues;
      } else {
        return {
          message: { value: '' },
          recipients: { value: [] },
          valid: true
        };
      }
    }

    return {
      message: { value: action.text },
      recipients: { value: getRecipients(action) },
      valid: true
    };
  }

  return {
    message: { value: '' },
    recipients: { value: [] },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  formState: SendBroadcastFormState
): BroadcastMsg => {
  return {
    legacy_vars: getExpressions(formState.recipients.value),
    contacts: getRecipientsByAsset(formState.recipients.value, AssetType.Contact),
    groups: getRecipientsByAsset(formState.recipients.value, AssetType.Group),
    text: formState.message.value,
    type: Types.send_broadcast,
    uuid: getActionUUID(settings, Types.send_broadcast)
  };
};
