import {
  getActionUUID,
  getExpressions,
  getRecipients,
  getRecipientsByAsset
} from 'components/flow/actions/helpers';
import {
  StartSessionFormState,
  START_TYPE_CREATE,
  START_TYPE_ASSETS,
  START_TYPE_QUERY
} from 'components/flow/actions/startsession/StartSessionForm';
import { Types } from 'config/interfaces';
import { StartSession } from 'flowTypes';
import { AssetType } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): StartSessionFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.start_session) {
    const action = settings.originalAction as StartSession;

    const init = {
      recipients: {
        value: getRecipients(action)
      },
      flow: {
        value: action.flow
      },
      startType: {
        value: action.create_contact
          ? START_TYPE_CREATE
          : action.contact_query
          ? START_TYPE_QUERY
          : START_TYPE_ASSETS
      },
      contactQuery: { value: action.contact_query || '' },
      valid: true
    };

    return init;
  }

  return {
    recipients: { value: [] },
    flow: { value: null },
    startType: { value: START_TYPE_ASSETS },
    contactQuery: { value: '' },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: StartSessionFormState
): StartSession => {
  const flow = state.flow.value;

  const action: StartSession = {
    legacy_vars: getExpressions(state.recipients.value),
    contacts: getRecipientsByAsset(state.recipients.value, AssetType.Contact),
    groups: getRecipientsByAsset(state.recipients.value, AssetType.Group),
    create_contact: state.startType.value === START_TYPE_CREATE,
    flow: { name: flow.name, uuid: flow.uuid },
    type: Types.start_session,
    uuid: getActionUUID(settings, Types.start_session)
  };

  // only include contact query if it is set
  if (state.contactQuery.value) {
    action['contact_query'] = state.contactQuery.value;
  }

  return action;
};
