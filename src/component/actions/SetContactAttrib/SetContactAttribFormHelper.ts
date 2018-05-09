import { v4 as generateUUID } from 'uuid';

import { FormHelper, Types } from '../../../config/typeConfigs';
import { SetContactAttribute, SetContactName } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { SetContactAttribFormState } from '../../../store/nodeEditor';
import { fieldToAsset, propertyToAsset } from './helpers';

export class SetContactAttribFormHelper implements FormHelper {
    // passed an existing action or null
    public actionToState(
        action: SetContactAttribute,
        type: Types.set_contact_field | Types.set_contact_name
    ): SetContactAttribFormState {
        const state = {
            uuid: action.uuid,
            type: action.type
        };

        // if we have an existing action, use it
        switch (action.type) {
            case Types.set_contact_field:
                return {
                    ...state,
                    field: fieldToAsset(action)
                };
            case Types.set_contact_name:
                return {
                    ...state,
                    name: propertyToAsset(action as SetContactName)
                };
            // otherwise, create a new action
            default:
                const uuid = generateUUID();
                switch (type) {
                    case Types.set_contact_field:
                        return {
                            uuid,
                            type: Types.set_contact_field,
                            field: fieldToAsset()
                        };
                    case Types.set_contact_name:
                        return {
                            uuid,
                            type: Types.set_contact_name,
                            name: ''
                        } as SetContactName;
                }
                return {
                    uuid: generateUUID(),
                    type: Types.send_broadcast,
                    text: '',
                    recipients: [],
                    translatedText: ''
                };
        }
    }

    public stateToAction(state: SetContactAttribFormState): SetContactAttribute {
        return {
            contacts: this.getAsset(state.recipients, AssetType.Contact),
            groups: this.getAsset(state.recipients, AssetType.Group),
            text: state.text,
            type: state.type,
            uuid: state.uuid
        };
    }

    private getAsset(assets: Asset[], type: AssetType): any[] {
        return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
            return { uuid: asset.id, name: asset.name };
        });
    }
}
