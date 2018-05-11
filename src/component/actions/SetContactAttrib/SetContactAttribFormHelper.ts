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
                        field: fieldToAsset(action),
                        value: action.value
                    } as SetContactFieldFormState;
                case Types.set_contact_name:
                    return {
                        name: propertyToAsset(action as SetContactName),
                        value: (action as SetContactName).name
                    } as SetContactNameFormState;
            }
        }

        // otherwise, provide initial form state from scratch
        switch (actionType) {
            case Types.set_contact_field:
                return {
                    field: fieldToAsset({} as SetContactField),
                    value: ''
                } as SetContactFieldFormState;
            case Types.set_contact_name:
                return {
                    name: propertyToAsset({} as SetContactName),
                    value: ''
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
                    field: assetToField((formState as SetContactFieldFormState).field),
                    value: (formState as SetContactFieldFormState).value
                } as SetContactField;
            case Types.set_contact_name:
                return {
                    ...action,
                    name: formState.value
                } as SetContactName;
        }
    }
}
