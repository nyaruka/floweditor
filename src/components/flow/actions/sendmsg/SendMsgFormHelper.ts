import { FormHelper, Types } from '~/config/typeConfigs';
import { SendMsg } from '~/flowTypes';
import { NodeEditorSettings, SendMsgFormState } from '~/store/nodeEditor';

export class SendMsgFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): SendMsgFormState {
        if (settings.originalAction && settings.originalAction.type === Types.send_msg) {
            let action = settings.originalAction as SendMsg;

            // check if our form should use a localized action
            if (settings.localizations && settings.localizations.length > 0) {
                const localized = settings.localizations[0];
                if (localized.isLocalized()) {
                    action = settings.localizations[0].getObject() as SendMsg;
                } else {
                    return {
                        type: Types.send_msg,
                        text: { value: '' },
                        quickReplies: { value: [] },
                        sendAll: false,
                        valid: true
                    };
                }
            }

            return {
                type: action.type,
                text: { value: action.text },
                quickReplies: { value: action.quick_replies || [] },
                sendAll: action.all_urns,
                valid: true
            };
        }

        return {
            type: Types.send_msg,
            text: { value: '' },
            quickReplies: { value: [] },
            sendAll: false,
            valid: false
        };
    }

    public stateToAction(uuid: string, state: SendMsgFormState): SendMsg {
        return {
            text: state.text.value,
            type: state.type,
            all_urns: state.sendAll,
            quick_replies: state.quickReplies.value,
            uuid
        };
    }
}
