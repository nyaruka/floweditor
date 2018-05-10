import { v4 as generateUUID } from 'uuid';

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
        type: Types.set_contact_field | Types.set_contact_name
    ): SetContactAttribFormState {
        const state: Action = {
            uuid: action.uuid,
            type: action.type
        };

        // if we have an existing contact attribute action, use it
        switch (action.type) {
            case Types.set_contact_field:
                return {
                    ...state,
                    field: fieldToAsset(action),
                    value: action.value
                } as SetContactFieldFormState;
            case Types.set_contact_name:
                return {
                    ...state,
                    name: propertyToAsset(action as SetContactName),
                    value: (action as SetContactName).name
                } as SetContactNameFormState;
            // otherwise, create a new contact attribute action
            default:
                const uuid = generateUUID();
                switch (type) {
                    case Types.set_contact_field:
                        return {
                            uuid,
                            type: Types.set_contact_field,
                            field: fieldToAsset({} as SetContactField)
                        } as SetContactFieldFormState;
                    case Types.set_contact_name:
                        return {
                            uuid,
                            type: Types.set_contact_name,
                            name: propertyToAsset({} as SetContactName)
                        } as SetContactNameFormState;
                }
        }
    }

    public stateToAction(state: SetContactAttribFormState): SetContactAttribute {
        const action: Action = {
            type: state.type,
            uuid: state.uuid
        };

        switch (state.type) {
            case Types.set_contact_field:
                return {
                    ...action,
                    field: assetToField((state as SetContactFieldFormState).field)
                } as SetContactField;
            case Types.set_contact_name:
                return {
                    ...action,
                    name: state.value
                } as SetContactName;
        }
    }
}
