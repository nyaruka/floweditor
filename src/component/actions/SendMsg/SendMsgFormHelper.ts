import { FormHelper, Types } from '../../../config/typeConfigs';
import { SendMsg } from '../../../flowTypes';
import { SendMsgFormState } from '../../../store/nodeEditor';

export class SendMsgFormHelper implements FormHelper {
    public actionToState(action: SendMsg): SendMsgFormState {
        if (action) {
            return {
                type: action.type,
                text: action.text,
                translatedText: action.text,
                quickReplies: action.quick_replies || [],
                sendAll: action.all_urns
            };
        }

        return {
            type: Types.send_msg,
            text: '',
            translatedText: '',
            quickReplies: [],
            sendAll: false
        };
    }

    public stateToAction(uuid: string, state: SendMsgFormState): SendMsg {
        return {
            text: state.text,
            type: state.type,
            all_urns: state.sendAll,
            quick_replies: state.quickReplies,
            uuid
        };
    }
}
