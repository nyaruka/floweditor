import { v4 as generateUUID } from 'uuid';

import { FormHelper, Types } from '../../../config/typeConfigs';
import { BroadcastMsg, Contact, Group } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { SendBroadcastFormState } from '../../../store/nodeEditor';

export class SendBroadcastFormHelper implements FormHelper {
    public actionToState(action: BroadcastMsg): SendBroadcastFormState {
        if (action) {
            return {
                uuid: action.uuid,
                type: action.type,
                text: action.text,
                recipients: this.getRecipients(action),
                translatedText: action.text
            };
        }

        return {
            uuid: generateUUID(),
            type: Types.send_broadcast,
            text: '',
            recipients: [],
            translatedText: ''
        };
    }

    public stateToAction(state: SendBroadcastFormState): BroadcastMsg {
        return {
            contacts: this.getAsset(state.recipients, AssetType.Contact),
            groups: this.getAsset(state.recipients, AssetType.Group),
            text: state.text,
            type: state.type,
            uuid: state.uuid
        };
    }

    private getRecipients(action: BroadcastMsg): Asset[] {
        const selected = action.groups.map((group: Group) => {
            return { id: group.uuid, name: group.name, type: AssetType.Group };
        });

        return selected.concat(
            action.contacts.map((contact: Contact) => {
                return { id: contact.uuid, name: contact.name, type: AssetType.Contact };
            })
        );
    }

    private getAsset(assets: Asset[], type: AssetType): any[] {
        return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
            return { uuid: asset.id, name: asset.name };
        });
    }
}
