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
import { Attachment } from 'components/flow/actions/sendmsg/attachments';
import { SendMsg, MsgTemplating } from 'flowTypes';
import { BroadcastMsg, ComposeAttachment } from 'flowTypes';
import { AssetType } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';

export const initializeForm = (settings: NodeEditorSettings): SendBroadcastFormState => {
  let template: any = { value: null };
  let templateVariables: any = [];

  const finalState: SendBroadcastFormState = {
    template,
    templateVariables,
    message: { value: '' },
    recipients: { value: [] },
    valid: true,
    attachments: [],
    validAttachment: false,
    attachmentError: ''
  };

  if (settings.originalAction && settings.originalAction.type === Types.send_broadcast) {
    let action = settings.originalAction as BroadcastMsg;
    const attachments: Attachment[] = [];
    (action.attachments || []).forEach((attachmentString: string) => {
      const splitPoint = attachmentString.indexOf(':');

      const type = attachmentString.substring(0, splitPoint);
      const attachment = {
        type,
        url: attachmentString.substring(splitPoint + 1),
        uploaded: type.indexOf('/') > -1
      };

      attachments.push(attachment);
    });

    finalState.attachments = attachments;

    if (action.templating) {
      const msgTemplate = action.templating.template;
      template = {
        value: {
          uuid: msgTemplate.uuid,
          name: msgTemplate.name
        }
      };
      templateVariables = action.templating.variables.map((value: string) => {
        return {
          value
        };
      });
    }

    finalState.template = template;
    finalState.templateVariables = templateVariables;
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

  // if (templating) {
  //   result.templating = templating;
  // }

  // return result;
};
