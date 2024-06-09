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
import { BroadcastMsg } from 'flowTypes';
import { AssetType } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';

export const initializeForm = (settings: NodeEditorSettings): SendBroadcastFormState => {
  let template: any = { value: null };
  let templateVariables: any = [];

  const finalState: SendBroadcastFormState = {
    template,
    templateVariables,
    compose: { value: '' },
    recipients: { value: [] },
    valid: true,
    attachments: [],
    validAttachment: false,
    attachmentError: '',
    uploadError: '',
    uploadInProgress: false
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
        return finalState;
      }
    }

    finalState.compose = { value: getCompose(action) };
    finalState.recipients = { value: getRecipients(action) };

    return finalState;
  }

  finalState.valid = false;

  return finalState;
};

export const stateToAction = (
  settings: NodeEditorSettings,
  formState: SendBroadcastFormState
): BroadcastMsg => {
  const compose = formState.compose.value;

  // not needed in glific
  // const text = getComposeByAsset(compose, AssetType.ComposeText);
  // const attachments = getComposeByAsset(compose, AssetType.ComposeAttachments).map(
  //   (attachment: ComposeAttachment) => `${attachment.content_type}:${attachment.url}`
  // );

  const attachments = formState.attachments
    .filter((attachment: Attachment) => attachment.url.trim().length > 0)
    .map((attachment: Attachment) => `${attachment.type}:${attachment.url}`);

  let templating: MsgTemplating = null;

  if (formState.template && formState.template.value) {
    let templatingUUID = createUUID();
    if (settings.originalAction && settings.originalAction.type === Types.send_msg) {
      const action = settings.originalAction as SendMsg;
      if (
        action.templating &&
        action.templating.template &&
        action.templating.template.uuid === formState.template.value.id
      ) {
        templatingUUID = action.templating.uuid;
      }
    }

    templating = {
      uuid: templatingUUID,
      template: {
        uuid: formState.template.value.uuid,
        name: formState.template.value.name
      },

      variables: formState.templateVariables.map((variable: StringEntry) => variable.value)
    };
  }
  let result: any = {
    legacy_vars: getExpressions(formState.recipients.value),
    contacts: getRecipientsByAsset(formState.recipients.value, AssetType.Contact),
    groups: getRecipientsByAsset(formState.recipients.value, AssetType.Group),
    compose: compose,
    text: formState.compose.value,
    attachments: attachments,
    type: Types.send_broadcast,
    uuid: getActionUUID(settings, Types.send_broadcast)
  };

  if (templating) {
    result.templating = templating;
  }
  return result;
};
