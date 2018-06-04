import { FormHelper, Types } from '../../../config/typeConfigs';
import {
    Channel,
    SetContactAttribute,
    SetContactChannel,
    SetContactField,
    SetContactLanguage,
    SetContactName,
} from '../../../flowTypes';
import { removeAsset } from '../../../services/AssetService';
import {
    NodeEditorSettings,
    SetContactAttribFormState,
    SetContactChannelFormState,
    SetContactFieldFormState,
    SetContactLanguageFormState,
    SetContactNameFormState,
} from '../../../store/nodeEditor';
import { getLanguage } from '../../../utils/languageMap';
import { assetToField, channelToAsset, fieldToAsset, languageToAsset, propertyToAsset } from './helpers';

export type SetContactAttribFormHelperActionTypes =
    | Types.set_contact_field
    | Types.set_contact_name
    | Types.set_contact_language
    | Types.set_contact_channel;

export class SetContactAttribFormHelper implements FormHelper {
    // passed an existing action or null
    public initializeForm(
        settings: NodeEditorSettings,
        actionType: SetContactAttribFormHelperActionTypes
    ): SetContactAttribFormState {
        let formState: SetContactAttribFormState;

        // if we have an existing contact attribute action, use it
        if (settings.originalAction) {
            const action = settings.originalAction as SetContactAttribute;
            switch (action.type) {
                case Types.set_contact_field:
                    formState = {
                        field: { value: fieldToAsset(action.field) },
                        value: { value: action.value },
                        valid: true
                    } as SetContactFieldFormState;
                    break;
                case Types.set_contact_name:
                    formState = {
                        name: { value: propertyToAsset(Types.set_contact_name) },
                        value: { value: (action as SetContactName).name },
                        valid: true
                    } as SetContactNameFormState;
                    break;
                case Types.set_contact_language:
                    const { language } = action as SetContactLanguage;
                    formState = {
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
                    break;
                case Types.set_contact_channel:
                    const { channel } = action as SetContactChannel;
                    formState = {
                        channel: { value: propertyToAsset(Types.set_contact_channel) },
                        value: {
                            value: Object.keys(channel).length
                                ? channelToAsset((action as SetContactChannel).channel)
                                : removeAsset
                        },
                        valid: true
                    } as SetContactChannelFormState;
                    break;
            }
        } else {
            // otherwise, provide initial form state from scratch
            switch (actionType) {
                case Types.set_contact_field:
                    formState = {
                        field: { value: fieldToAsset() },
                        value: { value: '' },
                        valid: false
                    } as SetContactFieldFormState;
                    break;
                case Types.set_contact_name:
                    formState = {
                        name: { value: propertyToAsset(Types.set_contact_name) },
                        value: { value: '' },
                        valid: false
                    } as SetContactNameFormState;
                    break;
                case Types.set_contact_language:
                    formState = {
                        language: { value: propertyToAsset(Types.set_contact_language) },
                        value: { value: removeAsset },
                        valid: false
                    } as SetContactLanguageFormState;
                    break;
                case Types.set_contact_channel:
                    formState = {
                        channel: { value: propertyToAsset(Types.set_contact_channel) },
                        value: { value: removeAsset },
                        valid: false
                    } as SetContactChannelFormState;
                    break;
            }
        }

        return formState;
    }

    public stateToAction(
        actionUUID: string,
        formState: SetContactAttribFormState,
        formType: Types
    ): SetContactAttribute {
        let action: Partial<SetContactAttribute> = {
            uuid: actionUUID,
            type: formType
        };

        switch (formType) {
            case Types.set_contact_field:
                action = {
                    ...action,
                    field: assetToField((formState as SetContactFieldFormState).field.value),
                    value: (formState as SetContactFieldFormState).value.value
                } as SetContactField;
                break;
            case Types.set_contact_name:
                action = {
                    ...action,
                    name: formState.value.value
                } as SetContactName;
                break;
            case Types.set_contact_language:
                action = {
                    ...action,
                    // we return an empty string to indicate the value is being cleared
                    language:
                        (formState as SetContactLanguageFormState).value.value.id === removeAsset.id
                            ? ''
                            : (formState as SetContactLanguageFormState).value.value.id
                } as SetContactLanguage;
                break;
            case Types.set_contact_channel:
                action = {
                    ...action,
                    // we return an empty string to indicate the value is being cleared
                    channel:
                        (formState as SetContactChannelFormState).value.value.id === removeAsset.id
                            ? {}
                            : ({
                                  uuid: (formState as SetContactChannelFormState).value.value.id,
                                  name: (formState as SetContactChannelFormState).value.value.name
                              } as Channel)
                } as SetContactChannel;
                break;
        }

        return action as SetContactAttribute;
    }
}
