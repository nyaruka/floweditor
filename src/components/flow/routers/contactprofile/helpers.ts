import { getActionUUID } from 'components/flow/actions/helpers';
import { createWebhookBasedNode } from 'components/flow/routers/helpers';

import { Types } from 'config/interfaces';
import { SetContactProfile } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';

import {
  ContactProfileRouterFormState,
  profileOptions,
  profileOptionsWithName
} from './ContactProfileRouterForm';

export const nodeToState = (settings: NodeEditorSettings): ContactProfileRouterFormState => {
  let resulNode: ContactProfileRouterFormState = {
    valid: true,
    optionType: { value: profileOptions['1'] },
    profileName: { value: '' },
    profileType: { value: '' }
  };

  if (settings.originalAction && settings.originalAction.type === Types.set_contact_profile) {
    const action = settings.originalAction as SetContactProfile;

    if (action.profile_type) {
      resulNode.optionType = {
        value: profileOptionsWithName[action.profile_type]
      };

      if (typeof action.value === 'string') {
        resulNode.profileName = { value: action.value };
      } else {
        resulNode.profileName = { value: action.value.name };
        resulNode.profileType = { value: action.value.type };
      }
    }
  }

  return resulNode;
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: ContactProfileRouterFormState
): RenderNode => {
  const { optionType, profileName, profileType } = state;

  const newAction: SetContactProfile = {
    profile_type: optionType.value.name,
    result_name: profileName.value,
    value:
      optionType.value.name === 'Create Profile'
        ? { name: profileName.value, type: profileType.value }
        : profileName.value,
    type: Types.set_contact_profile,
    uuid: getActionUUID(settings, Types.set_contact_profile)
  };

  return createWebhookBasedNode(newAction, settings.originalNode, false);
};
