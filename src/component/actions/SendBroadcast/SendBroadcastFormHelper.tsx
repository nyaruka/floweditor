import { v4 as generateUUID } from 'uuid';

import { FormHelper, Types } from '../../../config/typeConfigs';
import { BroadcastMsg } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { SendBroadcastFormState } from '../../../store/nodeEditor';
import { getRecipients } from './helpers';

export class SendBroadcastFormHelper implements FormHelper {
    public actionToState(action: BroadcastMsg): SendBroadcastFormState {
        if (action) {
            return {
                uuid: action.uuid,
                type: action.type,
                text: action.text,
                recipients: getRecipients(action),
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

    private getAsset(assets: Asset[], type: AssetType): any[] {
        return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
            return { uuid: asset.id, name: asset.name };
        });
    }
}
