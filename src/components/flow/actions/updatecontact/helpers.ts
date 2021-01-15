import { getActionUUID } from 'components/flow/actions/helpers';
import {
  CHANNEL_PROPERTY,
  LANGUAGE_PROPERTY,
  NAME_PROPERTY,
  STATUS_PROPERTY
} from 'components/flow/props';
import { Types, ContactStatus } from 'config/interfaces';
import { getTypeConfig } from 'config/typeConfigs';
import {
  Field,
  SetContactAttribute,
  SetContactChannel,
  SetContactField,
  SetContactLanguage,
  SetContactName,
  SetContactStatus
} from 'flowTypes';
import { Asset, AssetMap, AssetStore, AssetType, REMOVE_VALUE_ASSET } from 'store/flowContext';
import {
  FormState,
  NodeEditorSettings,
  StringEntry,
  SelectOptionEntry,
  FormEntry
} from 'store/nodeEditor';
import {
  CONTACT_STATUS_OPTIONS,
  CONTACT_STATUS_ACTIVE
} from 'components/flow/actions/updatecontact/UpdateContactForm';

export interface UpdateContactFormState extends FormState {
  type: Types;
  name: StringEntry;
  channel: FormEntry;
  language: FormEntry;
  status: SelectOptionEntry;
  field: FormEntry;
  fieldValue: StringEntry;
}

export const initializeForm = (
  settings: NodeEditorSettings,
  assetStore: AssetStore
): UpdateContactFormState => {
  const state: UpdateContactFormState = {
    type: Types.set_contact_name,
    valid: false,
    name: { value: '' },
    channel: { value: null },
    language: { value: null },
    status: { value: CONTACT_STATUS_ACTIVE },
    field: { value: NAME_PROPERTY },
    fieldValue: { value: '' }
  };

  if (settings.originalAction) {
    const originalType = settings.originalAction.type;
    // these have aliases, so compare the config we resolve to
    if (getTypeConfig(originalType) === getTypeConfig(Types.set_contact_field)) {
      state.type = originalType;

      switch (originalType) {
        case Types.set_contact_field:
          const fieldAction = settings.originalAction as SetContactField;
          state.field = { value: { key: fieldAction.field.key, label: fieldAction.field.name } };
          state.fieldValue = { value: fieldAction.value };
          state.valid = true;
          return state;
        case Types.set_contact_channel:
          const channelAction = settings.originalAction as SetContactChannel;
          state.field = { value: CHANNEL_PROPERTY };
          state.channel = {
            value: channelAction.channel ? channelAction.channel : REMOVE_VALUE_ASSET
          };
          state.valid = true;
          return state;
        case Types.set_contact_language:
          const languageAction = settings.originalAction as SetContactLanguage;
          state.field = { value: LANGUAGE_PROPERTY };
          state.valid = true;
          state.language = {
            value: languageAction.language
              ? {
                  iso: languageAction.language,
                  name: getLanguageForCode(languageAction.language, assetStore.languages.items)
                }
              : REMOVE_VALUE_ASSET
          };
          return state;
        case Types.set_contact_status:
          const statusAction = settings.originalAction as SetContactStatus;
          state.field = { value: STATUS_PROPERTY };
          state.valid = true;
          state.status = {
            value: CONTACT_STATUS_OPTIONS.find(o => o.value === statusAction.status)
          };
          return state;
        case Types.set_contact_name:
          const nameAction = settings.originalAction as SetContactName;
          state.valid = true;
          state.name = {
            value: nameAction.name
          };
          return state;
      }
    }
  }

  // default is updating name
  return state;
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: UpdateContactFormState
): SetContactAttribute => {
  /* istanbul ignore else */
  const field = state.field.value;
  if (state.type === Types.set_contact_field) {
    return {
      uuid: getActionUUID(settings, Types.set_contact_field),
      type: state.type,
      field: { name: field.label, key: field.key },
      value: state.fieldValue.value
    };
  } else if (state.type === Types.set_contact_channel) {
    if (state.channel.value.type === REMOVE_VALUE_ASSET.type) {
      return {
        uuid: getActionUUID(settings, Types.set_contact_channel),
        type: state.type
      } as any;
    }
    return {
      uuid: getActionUUID(settings, Types.set_contact_channel),
      type: state.type,
      channel: {
        uuid: state.channel.value.uuid,
        name: state.channel.value.name
      }
    };
  } else if (state.type === Types.set_contact_language) {
    if (state.language.value.type === REMOVE_VALUE_ASSET.type) {
      return {
        uuid: getActionUUID(settings, Types.set_contact_language),
        type: state.type
      } as any;
    }
    return {
      uuid: getActionUUID(settings, Types.set_contact_language),
      type: state.type,
      language: state.language.value.iso
    };
  } else if (state.type === Types.set_contact_status) {
    return {
      uuid: getActionUUID(settings, Types.set_contact_status),
      type: state.type,
      status: state.status.value.value as ContactStatus
    };
  } else if (state.type === Types.set_contact_name) {
    return {
      uuid: getActionUUID(settings, Types.set_contact_name),
      type: state.type,
      name: state.name.value
    };
  }
};

export const sortFieldsAndProperties = (a: any, b: any): number => {
  const aType = a.type || '';
  const bType = b.type || '';

  const aName = a.name || a.label || '';
  const bName = b.name || b.label || '';

  // Name always goes first
  /* istanbul ignore else */
  if (a.id === NAME_PROPERTY.id && b.id !== NAME_PROPERTY.id) {
    return -1;
  } else if (b.id === NAME_PROPERTY.id && a.id !== NAME_PROPERTY.id) {
    return 1;
  }

  if (aType === bType) {
    return aName.localeCompare(bName);
  }

  if (aType === AssetType.Scheme) {
    return 1;
  }

  if (bType === AssetType.Scheme) {
    return -1;
  }

  // go with alpha-sort for everthing else
  else if (aType !== bType) {
    if (aType === AssetType.ContactProperty) {
      return -1;
    }

    if (bType === AssetType.ContactProperty) {
      return 1;
    }
  }
  // non-name non-fields go last
  return aName.localeCompare(bName);
};

export const fieldToAsset = (field: Field = { key: '', name: '' }): Asset => ({
  id: field.key,
  name: field.name,
  type: AssetType.Field
});

export const assetToField = (asset: Asset): Field => ({
  key: asset.id,
  name: asset.name
});

export const assetToChannel = (asset: Asset): any => {
  if (asset.id === REMOVE_VALUE_ASSET.id) {
    return {};
  }

  return {
    uuid: asset.id,
    name: asset.name
  };
};

export const getLanguageForCode = (code: string, languages: AssetMap) => {
  let lang = code;
  if (languages && lang in languages) {
    lang = languages[lang].name;
  }
  return lang;
};

export const getName = (asset: any): string => {
  return asset.label || asset.name;
};
