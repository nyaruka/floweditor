import { getRecipients } from '~/components/flow/actions/helpers';
import { FormHelper, Types } from '~/config/typeConfigs';
import { BroadcastMsg } from '~/flowTypes';
import { Asset, AssetType } from '~/services/AssetService';
import { NodeEditorSettings, SendBroadcastFormState } from '~/store/nodeEditor';

export class SendBroadcastFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): SendBroadcastFormState {
        if (settings.originalAction) {
            let action = settings.originalAction as BroadcastMsg;

            // check if our form should use a localized action
            if (settings.localizations && settings.localizations.length > 0) {
                const localized = settings.localizations[0];
                if (localized.isLocalized()) {
                    action = settings.localizations[0].getObject() as BroadcastMsg;
                } else {
                    return {
                        type: Types.send_broadcast,
                        text: { value: '' },
                        recipients: { value: [] },
                        valid: true
                    };
                }
            }

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
