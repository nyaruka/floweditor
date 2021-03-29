import { KeyLocalizationFormState } from 'components/flow/actions/localization/KeyLocalizationForm';
import { MsgLocalizationFormState } from 'components/flow/actions/localization/MsgLocalizationForm';
import { Types } from 'config/interfaces';
import { getTypeConfig } from 'config/typeConfigs';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { SendMsg, MsgTemplating, SayMsg } from 'flowTypes';
import { Attachment } from '../sendmsg/attachments';

export const initializeLocalizedKeyForm = (
  settings: NodeEditorSettings
): KeyLocalizationFormState => {
  const keyValues: { [key: string]: StringEntry } = {};
  const localized = settings.localizations[0];
  const action = localized.getObject() as any;

  const keys = settings.originalAction
    ? getTypeConfig(settings.originalAction.type).localizeableKeys || []
    : [];
  keys.forEach((key: string) => {
    keyValues[key] = { value: key in localized.localizedKeys ? action[key] : '' };
  });

  return {
    keyValues,
    valid: true
  };
};

export const initializeLocalizedForm = (settings: NodeEditorSettings): MsgLocalizationFormState => {
  const state: MsgLocalizationFormState = {
    message: { value: '' },
    quickReplies: { value: [] },
    templateVariables: [],
    templating: null,
    audio: { value: null },
    valid: true,
    attachments: []
  };

  // check if our form should use a localized action
  if (
    settings.originalAction &&
    (settings.originalAction.type === Types.send_msg ||
      settings.originalAction.type === Types.say_msg) &&
    settings.localizations &&
    settings.localizations.length > 0
  ) {
    if (settings.originalAction && (settings.originalAction as any).templating) {
      state.templating = (settings.originalAction as any).templating;
      state.templateVariables = state.templating.variables.map((value: string) => {
        return {
          value: ''
        };
      });
    }

    for (const localized of settings.localizations) {
      if (localized.isLocalized()) {
        const localizedObject = localized.getObject() as any;

        if (localizedObject.text) {
          const action = localizedObject as (SendMsg & SayMsg);
          state.message.value = 'text' in localized.localizedKeys ? action.text : '';
          state.audio.value = 'audio_url' in localized.localizedKeys ? action.audio_url : null;
          state.quickReplies.value =
            'quick_replies' in localized.localizedKeys ? action.quick_replies || [] : [];

          const attachments: Attachment[] = [];

          if ('attachments' in localized.localizedKeys) {
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
          }

          state.attachments = attachments;
          state.valid = true;
        }

        if (localizedObject.variables) {
          const templating = localizedObject as MsgTemplating;
          state.templateVariables = templating.variables.map((value: string) => {
            return {
              value: 'variables' in localized.localizedKeys ? value : ''
            };
          });
          state.valid = true;
        }
      }
    }
  }
  return state;
};
