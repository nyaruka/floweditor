import { MsgLocalizationFormState } from 'components/flow/actions/localization/MsgLocalizationForm';
import { Types } from 'config/interfaces';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeLocalizedForm = (settings: NodeEditorSettings): MsgLocalizationFormState => {
  // check if our form should use a localized action
  if (
    settings.originalAction &&
    (settings.originalAction.type === Types.send_msg ||
      settings.originalAction.type === Types.say_msg) &&
    settings.localizations &&
    settings.localizations.length > 0
  ) {
    const localized = settings.localizations[0];
    if (localized.isLocalized()) {
      const action = localized.getObject() as any;
      return {
        message: {
          value: 'text' in localized.localizedKeys ? action.text : ''
        },
        quickReplies: {
          value: 'quick_replies' in localized.localizedKeys ? action.quick_replies || [] : []
        },
        audio: {
          value: 'audio_url' in localized.localizedKeys ? action.audio_url : null
        },
        valid: true
      };
    }
  }

  return {
    message: { value: '' },
    quickReplies: { value: [] },
    audio: { value: null },
    valid: true
  };
};
