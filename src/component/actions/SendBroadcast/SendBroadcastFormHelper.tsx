import { FormHelper, Types } from '../../../config/typeConfigs';
import { BroadcastMsg } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { SendBroadcastFormState } from '../../../store/nodeEditor';
import { getRecipients } from '../helpers';

export class SendBroadcastFormHelper implements FormHelper {
    public actionToState(action: BroadcastMsg): SendBroadcastFormState {
        if (action) {
            return {
                type: action.type,
                text: { value: action.text },
                recipients: { value: getRecipients(action) },
                valid: true
            };
        }

        return {
            type: Types.send_broadcast,
            text: { value: '' },
            recipients: { value: [] },
            valid: false
        };
    }

    public stateToAction(actionUUID: string, formState: SendBroadcastFormState): BroadcastMsg {
        return {
            contacts: this.getAsset(formState.recipients.value, AssetType.Contact),
            groups: this.getAsset(formState.recipients.value, AssetType.Group),
            text: formState.text.value,
            type: formState.type,
            uuid: actionUUID
        };
    }

    private getAsset(assets: Asset[], type: AssetType): any[] {
        return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
            return { uuid: asset.id, name: asset.name };
        });
    }
}
