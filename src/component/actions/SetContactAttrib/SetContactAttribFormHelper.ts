import { FormHelper, Types } from '../../../config/typeConfigs';
import { Action, SetContactAttribute, SetContactField, SetContactLanguage, SetContactName } from '../../../flowTypes';
import { removeAsset } from '../../../services/AssetService';
import {
    SetContactAttribFormState,
    SetContactFieldFormState,
    SetContactLanguageFormState,
    SetContactNameFormState,
} from '../../../store/nodeEditor';
import { getLanguage } from '../../../utils/languageMap';
import { assetToField, fieldToAsset, languageToAsset, propertyToAsset } from './helpers';

export class SetContactAttribFormHelper implements FormHelper {
    // passed an existing action or null
    public actionToState(
        action: SetContactAttribute,
        actionType: Types.set_contact_field | Types.set_contact_name | Types.set_contact_language
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
                    const language = (action as SetContactLanguage).language
                        ? languageToAsset(getLanguage((action as SetContactLanguage).language))
                        : null;
                    return {
                        language: { value: propertyToAsset(Types.set_contact_language) },
                        value: {
                            value: language
                        },
                        valid: true
                    } as SetContactLanguageFormState;
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
                    value: { value: null },
                    valid: false
                } as SetContactLanguageFormState;
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
        }
    }
}
