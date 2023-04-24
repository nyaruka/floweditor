import {
  getActionUUID,
  getCompose,
  getComposeByAsset,
  getExpressions,
  getRecipients,
  getRecipientsByAsset
} from 'components/flow/actions/helpers';
import { SendBroadcastFormState } from 'components/flow/actions/sendbroadcast/SendBroadcastForm';
import { Types } from 'config/interfaces';
import { BroadcastMsg, ComposeAttachment } from 'flowTypes';
import { AssetType } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): SendBroadcastFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_broadcast) {
    let action = settings.originalAction as BroadcastMsg;

    // check if our form should use a localized action
    if (settings.localizations && settings.localizations.length > 0) {
      const localized = settings.localizations[0];
      if (localized.isLocalized()) {
        action = settings.localizations[0].getObject() as BroadcastMsg;
      } else {
        return {
          compose: { value: getCompose() },
          recipients: { value: [] },
          valid: true
        };
      }
    }

    return {
      compose: { value: getCompose(action) },
      recipients: { value: getRecipients(action) },
      valid: true
    };
  }

  return {
    compose: { value: getCompose() },
    recipients: { value: [] },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  formState: SendBroadcastFormState
): BroadcastMsg => {
  const compose = formState.compose.value;
  const text = getComposeByAsset(compose, AssetType.ComposeText);
  const attachments = getComposeByAsset(compose, AssetType.ComposeAttachments).map(
    (attachment: ComposeAttachment) => `${attachment.content_type}:${attachment.url}`
  );

  return {
    legacy_vars: getExpressions(formState.recipients.value),
    contacts: getRecipientsByAsset(formState.recipients.value, AssetType.Contact),
    groups: getRecipientsByAsset(formState.recipients.value, AssetType.Group),
    compose: compose,
    text: text,
    attachments: attachments,
    type: Types.send_broadcast,
    uuid: getActionUUID(settings, Types.send_broadcast)
  };
};
