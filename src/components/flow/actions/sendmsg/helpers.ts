/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { SendMsgFormState } from 'components/flow/actions/sendmsg/SendMsgForm';
import { Types } from 'config/interfaces';
import { SendMsg } from 'flowTypes';
import { FormEntry, NodeEditorSettings } from 'store/nodeEditor';
import { SelectOption } from 'components/form/select/SelectElement';
import { Attachment } from './attachments';

export const TOPIC_OPTIONS: SelectOption[] = [
  { value: 'event', name: 'Event' },
  { value: 'account', name: 'Account' },
  { value: 'purchase', name: 'Purchase' },
  { value: 'agent', name: 'Agent' }
];

export const initializeForm = (settings: NodeEditorSettings): SendMsgFormState => {
  let template: FormEntry = { value: null };
  if (settings.originalAction && settings.originalAction.type === Types.send_msg) {
    const action = settings.originalAction as SendMsg;
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

    return {
      topic: { value: TOPIC_OPTIONS.find(option => option.value === action.topic) },
      template: { value: action.template },
      templateVariables: { value: action.template_variables },
      attachments,
      uploadInProgress: false,
      uploadError: '',
      message: { value: action.text },
      quickReplies: { value: action.quick_replies || [] },
      quickReplyEntry: { value: '' },
      sendAll: action.all_urns,
      valid: true
    };
  }

  return {
    topic: { value: null },
    template: { value: template },
    attachments: [],
    uploadInProgress: false,
    uploadError: '',
    message: { value: '' },
    quickReplies: { value: [] },
    quickReplyEntry: { value: '' },
    templateVariables: { value: [] },
    sendAll: false,
    valid: false
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

  if (state.template.value) {
    result.template = state.template.value;
    result.template_variables = state.templateVariables.value;
  }

  if (state.topic.value) {
    result.topic = state.topic.value.value;
  }

  return result;
};
