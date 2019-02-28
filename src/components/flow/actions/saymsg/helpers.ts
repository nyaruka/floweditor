import { getActionUUID } from '~/components/flow/actions/helpers';
import { SayMsgFormState } from '~/components/flow/actions/saymsg/SayMsgForm';
import { Types } from '~/config/typeConfigs';
import { SayMsg } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): SayMsgFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.say_msg) {
        const action = settings.originalAction as SayMsg;
        return {
            text: { value: action.text },
            audio: { value: action.audio_url },
            valid: true
        };
    }

    return {
        text: { value: '' },
        audio: { value: '' },
        valid: false
    };
};

export const stateToAction = (settings: NodeEditorSettings, state: SayMsgFormState): SayMsg => ({
    text: state.text.value,
    audio_url: state.audio.value,
    type: Types.say_msg,
    uuid: getActionUUID(settings, Types.say_msg)
});
