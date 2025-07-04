/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { SendMsgFormState } from 'components/flow/actions/sendmsg/SendMsgForm';
import { Types } from 'config/interfaces';
import { SendMsg } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';
import { Attachment } from './attachments';
import { store } from 'store';

export const initializeForm = (settings: NodeEditorSettings): SendMsgFormState => {
  let template: { uuid: string; name: string } = null;
  let templateVariables: string[] = [];

  if (settings.originalAction && settings.originalAction.type === Types.send_msg) {
    const action = settings.originalAction as SendMsg;
    const attachments: Attachment[] = [];

    if (action.template) {
      template = action.template;
      templateVariables = action.template_variables || [];
    }

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

    return {
      template,
      templateVariables,
      attachments,
      uploadInProgress: false,
      uploadError: '',
      message: { value: action.text },
      quickReplies: { value: action.quick_replies || [] },
      quickReplyEntry: { value: '' },
      sendAll: action.all_urns,
      valid: true,
      languageCode: store.getState().languageCode
    };
  }

  return {
    template,
    templateVariables,
    attachments: [],
    uploadInProgress: false,
    uploadError: '',
    message: { value: '' },
    quickReplies: { value: [] },
    quickReplyEntry: { value: '' },
    sendAll: false,
    valid: false,
    languageCode: store.getState().languageCode
  };
};

export const stateToAction = (settings: NodeEditorSettings, state: SendMsgFormState): SendMsg => {
  const attachments = state.attachments
    .filter((attachment: Attachment) => attachment.url.trim().length > 0)
    .map((attachment: Attachment) => `${attachment.type}:${attachment.url}`);

  const result: SendMsg = {
    attachments,
    text: state.message.value,
    type: Types.send_msg,
    all_urns: state.sendAll,
    quick_replies: state.quickReplies.value,
    uuid: getActionUUID(settings, Types.send_msg)
  };

  if (state.template) {
    result.template = state.template;
    result.template_variables = state.templateVariables;
  }

  return result;
};
