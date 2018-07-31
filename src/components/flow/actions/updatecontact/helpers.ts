import {
    CHANNEL_PROPERTY,
    LANGUAGE_PROPERTY,
    NAME_PROPERTY,
    UpdateContactFormState
} from '~/components/flow/actions/updatecontact/UpdateContactForm';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import {
    Channel,
    Field,
    Language,
    SetContactAttribute,
    SetContactChannel,
    SetContactField,
    SetContactLanguage,
    SetContactName
} from '~/flowTypes';
import { Asset, AssetType, removeAsset } from '~/services/AssetService';
import { NodeEditorSettings } from '~/store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): UpdateContactFormState => {
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
                            name: languageAction.language
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

export const stateToAction = (uuid: string, state: UpdateContactFormState): SetContactAttribute => {
    if (state.type === Types.set_contact_field) {
        return {
            uuid,
            type: state.type,
            field: assetToField(state.field.value),
            value: state.fieldValue.value
        };
    }

    if (state.type === Types.set_contact_channel) {
        return {
            uuid,
            type: state.type,
            channel: assetToChannel(state.channel.value)
        };
    }

    if (state.type === Types.set_contact_language) {
        return {
            uuid,
            type: state.type,
            language: assetToLanguage(state.language.value)
        };
    }

    if (state.type === Types.set_contact_name) {
        return {
            uuid,
            type: state.type,
            name: state.name.value
        };
    }
};

export const sortFieldsAndProperties = (a: Asset, b: Asset): number => {
    // Name always goes first
    if (a === NAME_PROPERTY) {
        return -1;
    }

    if (b === NAME_PROPERTY) {
        return 1;
    }

    // go with alpha-sort for everthing else
    if (a.type === b.type) {
        return a.name.localeCompare(b.name);
    }

    // non-name non-fields go last
    if (a.type !== AssetType.Field) {
        return 1;
    }

    if (b.type !== AssetType.Field) {
        return -1;
    }

    return 0;
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
    if (asset.id === removeAsset.id) {
        return {};
    }

    return {
        uuid: asset.id,
        name: asset.name
    };
};

export const assetToLanguage = (asset: Asset): string => {
    if (asset.id === removeAsset.id) {
        return '';
    }
    return asset.id;
};

export const languageToAsset = ({ iso, name }: Language) => {
    if (!iso || iso.length === 0) {
        return removeAsset;
    }

    return {
        id: iso,
        name,
        type: AssetType.Language
    };
};

export const channelToAsset = ({ uuid, name }: Channel) => {
    if (!uuid) {
        return removeAsset;
    }
    return {
        id: uuid,
        name,
        type: AssetType.Language
    };
};
