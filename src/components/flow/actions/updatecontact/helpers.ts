import { getActionUUID } from 'components/flow/actions/helpers';
import { CHANNEL_PROPERTY, LANGUAGE_PROPERTY, NAME_PROPERTY } from 'components/flow/props';
import { Types } from 'config/interfaces';
import { getTypeConfig } from 'config/typeConfigs';
import {
  Channel,
  Field,
  Language,
  SetContactAttribute,
  SetContactChannel,
  SetContactField,
  SetContactLanguage,
  SetContactName
} from 'flowTypes';
import { Asset, AssetMap, AssetStore, AssetType, REMOVE_VALUE_ASSET } from 'store/flowContext';
import { AssetEntry, FormState, NodeEditorSettings, StringEntry } from 'store/nodeEditor';

export interface UpdateContactFormState extends FormState {
  type: Types;
  name: StringEntry;
  channel: AssetEntry;
  language: AssetEntry;
  field: AssetEntry;
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
          state.field = { value: fieldToAsset(fieldAction.field) };
          state.fieldValue = { value: fieldAction.value };
          state.valid = true;
          return state;
        case Types.set_contact_channel:
          const channelAction = settings.originalAction as SetContactChannel;
          state.field = { value: CHANNEL_PROPERTY };
          state.channel = { value: channelToAsset(channelAction.channel) };
          state.valid = true;
          return state;
        case Types.set_contact_language:
          const languageAction = settings.originalAction as SetContactLanguage;
          state.field = { value: LANGUAGE_PROPERTY };
          state.valid = true;
          state.language = {
            value: languageToAsset({
              iso: languageAction.language,
              name: getLanguageForCode(languageAction.language, assetStore.languages.items)
            })
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
  if (state.type === Types.set_contact_field) {
    return {
      uuid: getActionUUID(settings, Types.set_contact_field),
      type: state.type,
      field: assetToField(state.field.value),
      value: state.fieldValue.value
    };
  } else if (state.type === Types.set_contact_channel) {
    return {
      uuid: getActionUUID(settings, Types.set_contact_channel),
      type: state.type,
      channel: assetToChannel(state.channel.value)
    };
  } else if (state.type === Types.set_contact_language) {
    return {
      uuid: getActionUUID(settings, Types.set_contact_language),
      type: state.type,
      language: assetToLanguage(state.language.value)
    };
  } else if (state.type === Types.set_contact_name) {
    return {
      uuid: getActionUUID(settings, Types.set_contact_name),
      type: state.type,
      name: state.name.value
    };
  }
};

export const sortFieldsAndProperties = (a: Asset, b: Asset): number => {
  // Name always goes first
  /* istanbul ignore else */
  if (a === NAME_PROPERTY && b !== NAME_PROPERTY) {
    return -1;
  } else if (b === NAME_PROPERTY && a !== NAME_PROPERTY) {
    return 1;
  }

  if (a.type === b.type) {
    return a.name.localeCompare(b.name);
  }

  if (a.type === AssetType.Scheme) {
    return 1;
  }

  // go with alpha-sort for everthing else
  else if (a.type !== b.type) {
    if (a.type === AssetType.ContactProperty) {
      return -1;
    }

    if (b.type === AssetType.ContactProperty) {
      return 1;
    }
  }
  // non-name non-fields go last
  return a.name.localeCompare(b.name);
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

export const assetToLanguage = (asset: Asset): string => {
  if (asset.id === REMOVE_VALUE_ASSET.id) {
    return '';
  }
  return asset.id;
};

export const languageToAsset = ({ iso, name }: Language) => {
  if (!iso || iso.length === 0) {
    return REMOVE_VALUE_ASSET;
  }

  return {
    id: iso,
    name,
    type: AssetType.Language
  };
};

export const channelToAsset = ({ uuid, name }: Channel) => {
  if (!uuid) {
    return REMOVE_VALUE_ASSET;
  }
  return {
    id: uuid,
    name,
    type: AssetType.Language
  };
};

export const getLanguageForCode = (code: string, languages: AssetMap) => {
  let lang = code;
  if (languages && lang in languages) {
    lang = languages[lang].name;
  }
  return lang;
};
