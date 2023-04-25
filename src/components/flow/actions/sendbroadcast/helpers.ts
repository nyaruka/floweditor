import {
  getActionUUID,
  getComposeActionToState,
  getComposeStateToAction,
  getRecipients,
  getRecipientsStateToAction
} from 'components/flow/actions/helpers';
import { SendBroadcastFormState } from 'components/flow/actions/sendbroadcast/SendBroadcastForm';
import { Types } from 'config/interfaces';
import { BroadcastMsg } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): SendBroadcastFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_broadcast) {
    let action = settings.originalAction as BroadcastMsg;

    // check if our form should use a localized action
    if (settings.localizations && settings.localizations.length > 0) {
      const localized = settings.localizations[0];
      if (localized.isLocalized()) {
        action = settings.localizations[0].getObject() as BroadcastMsg;
      } else {
        return {
          compose: { value: getComposeActionToState() },
          recipients: { value: [] },
          valid: true
        };
      }
    }

    return {
      compose: { value: getComposeActionToState(action) },
      recipients: { value: getRecipients(action) },
      valid: true
    };
  }

  return {
    compose: { value: getComposeActionToState() },
    recipients: { value: [] },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  formState: SendBroadcastFormState
): BroadcastMsg => {
  const [compose, text, attachments] = getComposeStateToAction(formState);
  const [legacy_vars, contacts, groups] = getRecipientsStateToAction(formState);

  return {
    legacy_vars: legacy_vars,
    contacts: contacts,
    groups: groups,
    compose: compose,
    text: text,
    attachments: attachments,
    type: Types.send_broadcast,
    uuid: getActionUUID(settings, Types.send_broadcast)
  };
};
