import { FormHelper, Types } from '../../../config/typeConfigs';
import {
    Action,
    Channel,
    SetContactAttribute,
    SetContactChannel,
    SetContactField,
    SetContactLanguage,
    SetContactName,
} from '../../../flowTypes';
import { removeAsset } from '../../../services/AssetService';
import {
    SetContactAttribFormState,
    SetContactChannelFormState,
    SetContactFieldFormState,
    SetContactLanguageFormState,
    SetContactNameFormState,
} from '../../../store/nodeEditor';
import { getLanguage } from '../../../utils/languageMap';
import { assetToField, channelToAsset, fieldToAsset, languageToAsset, propertyToAsset } from './helpers';

export type AttribType =
    | Types.set_contact_field
    | Types.set_contact_name
    | Types.set_contact_language
    | Types.set_contact_channel;

export class SetContactAttribFormHelper implements FormHelper {
    // passed an existing action or null
    public actionToState(
        action: SetContactAttribute,
        actionType: AttribType
    ): SetContactAttribFormState {
        // if we have an existing contact attribute action, use it
        if (action) {
            switch (action.type) {
                case Types.set_contact_field:
                    return {
                        field: { value: fieldToAsset(action.field) },
                        value: { value: action.value },
                        valid: true
                    } as SetContactFieldFormState;
                case Types.set_contact_name:
                    return {
                        name: { value: propertyToAsset(Types.set_contact_name) },
                        value: { value: (action as SetContactName).name },
                        valid: true
                    } as SetContactNameFormState;
                case Types.set_contact_language:
                    const { language } = action as SetContactLanguage;
                    return {
                        language: { value: propertyToAsset(Types.set_contact_language) },
                        value: {
                            value: language
                                ? languageToAsset(
                                      getLanguage((action as SetContactLanguage).language)
                                  )
                                : removeAsset
                        },
                        valid: true
                    } as SetContactLanguageFormState;
                case Types.set_contact_channel:
                    const { channel } = action as SetContactChannel;
                    return {
                        channel: { value: propertyToAsset(Types.set_contact_channel) },
                        value: {
                            value: channel
                                ? channelToAsset((action as SetContactChannel).channel)
                                : removeAsset
                        },
                        valid: true
                    } as SetContactChannelFormState;
            }
        }

        // otherwise, provide initial form state from scratch
        switch (actionType) {
            case Types.set_contact_field:
                return {
                    field: { value: fieldToAsset() },
                    value: { value: '' },
                    valid: false
                } as SetContactFieldFormState;
            case Types.set_contact_name:
                return {
                    name: { value: propertyToAsset(Types.set_contact_name) },
                    value: { value: '' },
                    valid: false
                } as SetContactNameFormState;
            case Types.set_contact_language:
                return {
                    language: { value: propertyToAsset(Types.set_contact_language) },
                    value: { value: removeAsset },
                    valid: false
                } as SetContactLanguageFormState;
            case Types.set_contact_channel:
                return {
                    channel: { value: propertyToAsset(Types.set_contact_channel) },
                    value: { value: removeAsset },
                    valid: false
                } as SetContactChannelFormState;
        }
    }

    public stateToAction(
        actionUUID: string,
        formState: SetContactAttribFormState,
        formType: Types
    ): SetContactAttribute {
        const action: Partial<Action> = {
            uuid: actionUUID,
            type: formType
        };

        switch (formType) {
            case Types.set_contact_field:
                return {
                    ...action,
                    field: assetToField((formState as SetContactFieldFormState).field.value),
                    value: (formState as SetContactFieldFormState).value.value
                } as SetContactField;
            case Types.set_contact_name:
                return {
                    ...action,
                    name: formState.value.value
                } as SetContactName;
            case Types.set_contact_language:
                return {
                    ...action,
                    // we return an empty string to indicate the value is being cleared
                    language:
                        (formState as SetContactLanguageFormState).value.value.id === removeAsset.id
                            ? ''
                            : (formState as SetContactLanguageFormState).value.value.id
                } as SetContactLanguage;
            case Types.set_contact_channel:
                return {
                    ...action,
                    // we return an empty string to indicate the value is being cleared
                    channel:
                        (formState as SetContactChannelFormState).value.value.id === removeAsset.id
                            ? ''
                            : ({
                                  uuid: (formState as SetContactChannelFormState).value.value.id,
                                  name: (formState as SetContactChannelFormState).value.value.name
                              } as Channel)
                } as SetContactChannel;
        }
    }
}
