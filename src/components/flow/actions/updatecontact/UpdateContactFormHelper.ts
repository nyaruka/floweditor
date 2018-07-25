import {
    assetToChannel,
    assetToField,
    assetToLanguage,
    channelToAsset,
    fieldToAsset,
    languageToAsset
} from '~/components/flow/actions/updatecontact/helpers';
import {
    CHANNEL_PROPERTY,
    LANGUAGE_PROPERTY,
    NAME_PROPERTY,
    UpdateContactFormState
} from '~/components/flow/actions/updatecontact/UpdateContactForm';
import { FormHelper, getTypeConfig, Types } from '~/config/typeConfigs';
import {
    SetContactAttribute,
    SetContactChannel,
    SetContactField,
    SetContactLanguage,
    SetContactName
} from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

export class UpdateContactFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): UpdateContactFormState {
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
    }

    public stateToAction(uuid: string, state: UpdateContactFormState): SetContactAttribute {
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
    }
}
