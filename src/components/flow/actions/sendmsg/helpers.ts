import { getActionUUID } from '~/components/flow/actions/helpers';
import { Attachment, SendMsgFormState } from '~/components/flow/actions/sendmsg/SendMsgForm';
import { Types } from '~/config/interfaces';
import { MsgTemplating, SendMsg } from '~/flowTypes';
import { AssetStore, AssetType } from '~/store/flowContext';
import { AssetEntry, NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export const initializeForm = (
    settings: NodeEditorSettings,
    assetStore: AssetStore
): SendMsgFormState => {
    let template: AssetEntry = { value: null };
    let templateVariables: StringEntry[] = [];

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

        if (action.templating) {
            const msgTemplate = action.templating.template;
            template = {
                value: { id: msgTemplate.uuid, name: msgTemplate.name, type: AssetType.Template }
            };
            templateVariables = action.templating.variables.map((value: string) => {
                return {
                    value
                };
            });
        }

        return {
            template,
            templateVariables,
            attachments,
            message: { value: action.text },
            quickReplies: { value: action.quick_replies || [] },
            sendAll: action.all_urns,
            valid: true
        };
    }

    return {
        template,
        templateVariables: [],
        attachments: [],
        message: { value: '' },
        quickReplies: { value: [] },
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
        templating = {
            template: { uuid: state.template.value.id, name: state.template.value.name },
            variables: state.templateVariables.map((variable: StringEntry) => variable.value)
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

    return result;
};
