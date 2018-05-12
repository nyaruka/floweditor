import { FormHelper, Types } from '../../../config/typeConfigs';
import { SendMsg } from '../../../flowTypes';
import { SendMsgFormState } from '../../../store/nodeEditor';

export class SendMsgFormHelper implements FormHelper {
    public actionToState(action: SendMsg): SendMsgFormState {
        if (action) {
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
