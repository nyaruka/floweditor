import { getActionUUID } from "components/flow/actions/helpers";
import { PlayAudioFormState } from "components/flow/actions/playaudio/PlayAudioForm";
import { Types } from "config/interfaces";
import { PlayAudio } from "flowTypes";
import { NodeEditorSettings } from "store/nodeEditor";

export const initializeForm = (
  settings: NodeEditorSettings
): PlayAudioFormState => {
  if (
    settings.originalAction &&
    settings.originalAction.type === Types.play_audio
  ) {
    const action = settings.originalAction as PlayAudio;
    return {
      audio: { value: action.audio_url },
      valid: true
    };
  }

  return {
    audio: { value: "" },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: PlayAudioFormState
): PlayAudio => ({
  audio_url: state.audio.value,
  type: Types.play_audio,
  uuid: getActionUUID(settings, Types.say_msg)
});
