/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { SendMsgFormState } from 'components/flow/actions/sendmsg/SendMsgForm';
import { Types } from 'config/interfaces';
import { MsgTemplating, SendMsg } from 'flowTypes';
import { FormEntry, NodeEditorSettings } from 'store/nodeEditor';
import { SelectOption } from 'components/form/select/SelectElement';
import { Attachment } from './attachments';
import { createUUID } from 'utils';

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

    let paramsByTemplate: any = {};
    if (action.templating) {
      const msgTemplate = action.templating.template;
      template = {
        value: {
          uuid: msgTemplate.uuid,
          name: msgTemplate.name
        }
      };

      if (action.templating.components && action.templating.components.length > 0) {
        paramsByTemplate = {
          [action.templating.template.uuid]: {}
        };
        action.templating.components.forEach((component: any) => {
          paramsByTemplate[action.templating.template.uuid][component.name] = component.params;
        });
      }
    }

    return {
      topic: { value: TOPIC_OPTIONS.find(option => option.value === action.topic) },
      template,
      attachments,
      uploadInProgress: false,
      uploadError: '',
      message: { value: action.text },
      quickReplies: { value: action.quick_replies || [] },
      quickReplyEntry: { value: '' },
      sendAll: action.all_urns,
      paramsByTemplate,
      valid: true
    };
  }

  return {
    topic: { value: null },
    template,
    attachments: [],
    uploadInProgress: false,
    uploadError: '',
    message: { value: '' },
    quickReplies: { value: [] },
    quickReplyEntry: { value: '' },
    paramsByTemplate: {},
    sendAll: false,
    valid: false
  };
};

export const stateToAction = (settings: NodeEditorSettings, state: SendMsgFormState): SendMsg => {
  const attachments = state.attachments
    .filter((attachment: Attachment) => attachment.url.trim().length > 0)
    .map((attachment: Attachment) => `${attachment.type}:${attachment.url}`);

  let templating: MsgTemplating = null;
  if (state.template && state.template.value) {
    const originalAction =
      settings.originalAction.type === Types.send_msg ? (settings.originalAction as SendMsg) : null;

    let components =
      originalAction.templating && originalAction.templating.components
        ? originalAction.templating.components
        : [];

    if (state.templateTranslation) {
      components = Object.keys(state.templateTranslation.components).map((key: string) => {
        let uuid = createUUID();

        // try looking up the uuid from the original action
        if (settings.originalAction && settings.originalAction.type === Types.send_msg) {
          const originalAction = settings.originalAction as SendMsg;
          if (originalAction.templating) {
            const originalComponent = originalAction.templating.components.find(
              (component: any) => component.name === key
            );
            if (originalComponent) {
              uuid = originalComponent.uuid;
            }
          }
        }

        return {
          uuid,
          name: key,
          params: state.paramsByTemplate[state.template.value.uuid][key]
        };
      });
    }

    templating = {
      template: {
        uuid: state.template.value.uuid,
        name: state.template.value.name
      },
      components
    };
  }

  const result: SendMsg = {
    attachments,
    text: state.message.value,
    type: Types.send_msg,
    all_urns: state.sendAll,
    quick_replies: state.quickReplies.value,
    uuid: getActionUUID(settings, Types.send_msg)
  };

  if (templating) {
    result.templating = templating;
  }

  if (state.topic.value) {
    result.topic = state.topic.value.value;
  }

  return result;
};
