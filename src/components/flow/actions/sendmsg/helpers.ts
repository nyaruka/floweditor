/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { SendMsgFormState } from 'components/flow/actions/sendmsg/SendMsgForm';
import { Types } from 'config/interfaces';
import { FlowEditorConfig, Label, MsgTemplating, SendMsg } from 'flowTypes';
import { FormEntry, NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { SelectOption } from 'components/form/select/SelectElement';
import { createUUID } from 'utils';
import { Attachment } from './attachments';

export const TOPIC_OPTIONS: SelectOption[] = [
  { value: 'event', name: 'Event' },
  { value: 'account', name: 'Account' },
  { value: 'purchase', name: 'Purchase' },
  { value: 'agent', name: 'Agent' }
];

export const initializeForm = (
  settings: NodeEditorSettings,
  config: FlowEditorConfig
): SendMsgFormState => {
  let template: FormEntry = { value: null };
  let templateVariables: StringEntry[] = [];
  let skipValidation = false;

  if (settings.originalAction && settings.originalAction.type === Types.send_msg) {
    const action = settings.originalAction as SendMsg;
    const attachments: Attachment[] = [];
    let expressionValue = null;
    (action.attachments || []).forEach((attachmentString: string) => {
      const splitPoint = attachmentString.indexOf(':');

      const type = attachmentString.substring(0, splitPoint);
      const attachment = {
        type,
        url: attachmentString.substring(splitPoint + 1),
        uploaded: type.indexOf('/') > -1,
        valid: false
      };

      attachments.push(attachment);
    });

    if (action.templating) {
      const msgTemplate = action.templating.template;
      if (action.templating.expression) {
        expressionValue = { value: action.templating.expression };
      }
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

    const labels = action.labels
      ? action.labels.map((label: Label) => {
          if (label.name_match) {
            return { name: label.name_match, expression: true };
          }
          return label;
        })
      : [];

    if (config.skipValidation) {
      skipValidation = config.skipValidation;
    }

    return {
      expression: expressionValue,
      topic: { value: TOPIC_OPTIONS.find(option => option.value === action.topic) },
      template,
      templateVariables,
      attachments,
      labels: {
        value: labels
      },
      uploadInProgress: false,
      uploadError: '',
      message: { value: action.text },
      quickReplies: { value: action.quick_replies || [] },
      quickReplyEntry: { value: '' },
      sendAll: action.all_urns,
      valid: true,
      skipValidation
    };
  }

  return {
    topic: { value: null },
    template,
    templateVariables: [],
    attachments: [],
    uploadInProgress: false,
    uploadError: '',
    message: { value: '' },
    quickReplies: { value: [] },
    quickReplyEntry: { value: '' },
    sendAll: false,
    valid: false,
    labels: { value: [] }
  };
};

export const stateToAction = (settings: NodeEditorSettings, state: SendMsgFormState): SendMsg => {
  const attachments = state.attachments
    .filter((attachment: Attachment) => attachment.url.trim().length > 0)
    .map((attachment: Attachment) => `${attachment.type}:${attachment.url}`);

  let templating: MsgTemplating = null;

  if (state.template && state.template.value) {
    let templatingUUID = createUUID();
    if (settings.originalAction && settings.originalAction.type === Types.send_msg) {
      const action = settings.originalAction as SendMsg;
      if (
        action.templating &&
        action.templating.template &&
        action.templating.template.uuid === state.template.value.id
      ) {
        templatingUUID = action.templating.uuid;
      }
    }

    templating = {
      uuid: templatingUUID,
      template: {
        uuid: state.template.value.uuid,
        name: state.template.value.name
      },
      variables: state.templateVariables.map((variable: StringEntry) => variable.value)
    };

    if (state.expression && state.expression.value) {
      templating.expression = state.expression.value;
    }
  }
  const result: SendMsg = {
    attachments,
    text: state.message.value,
    type: Types.send_msg,
    all_urns: state.sendAll,
    labels: state.labels.value.map((label: any) => {
      if (label.expression) {
        return { name_match: label.name };
      }
      return label;
    }),
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
