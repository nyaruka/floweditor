import { FormHelper, Types } from '../../../config/typeConfigs';
import { Action, SetContactAttribute, SetContactField, SetContactName } from '../../../flowTypes';
import {
    SetContactAttribFormState,
    SetContactFieldFormState,
    SetContactNameFormState
} from '../../../store/nodeEditor';
import { assetToField, fieldToAsset, propertyToAsset } from './helpers';

export class SetContactAttribFormHelper implements FormHelper {
    // passed an existing action or null
    public actionToState(
        action: SetContactAttribute,
        actionType: Types.set_contact_field | Types.set_contact_name
    ): SetContactAttribFormState {
        // if we have an existing contact attribute action, use it
        if (action) {
            switch (action.type) {
                case Types.set_contact_field:
                    return {
                        field: { value: fieldToAsset(action) },
                        value: { value: action.value },
                        valid: true
                    } as SetContactFieldFormState;
                case Types.set_contact_name:
                    return {
                        name: { value: propertyToAsset(action as SetContactName) },
                        value: { value: (action as SetContactName).name },
                        valid: true
                    } as SetContactNameFormState;
            }
        }

        // otherwise, provide initial form state from scratch
        switch (actionType) {
            case Types.set_contact_field:
                return {
                    field: { value: fieldToAsset({} as SetContactField) },
                    value: { value: '' },
                    valid: false
                } as SetContactFieldFormState;
            case Types.set_contact_name:
                return {
                    name: { value: propertyToAsset({} as SetContactName) },
                    value: { value: '' },
                    valid: false
                } as SetContactNameFormState;
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
        }
    }
}
