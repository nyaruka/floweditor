import { getActionUUID, getRecipients } from '~/components/flow/actions/helpers';
import { SendBroadcastFormState } from '~/components/flow/actions/sendbroadcast/SendBroadcastForm';
import { Types } from '~/config/typeConfigs';
import { BroadcastMsg } from '~/flowTypes';
import { Asset, AssetType } from '~/services/AssetService';
import { NodeEditorSettings } from '~/store/nodeEditor';

export const initializeForm = (settings: NodeEditorSettings): SendBroadcastFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.send_broadcast) {
        let action = settings.originalAction as BroadcastMsg;

        // check if our form should use a localized action
        if (settings.localizations && settings.localizations.length > 0) {
            const localized = settings.localizations[0];
            if (localized.isLocalized()) {
                action = settings.localizations[0].getObject() as BroadcastMsg;
            } else {
                return {
                    text: { value: '' },
                    recipients: { value: [] },
                    valid: true
                };
            }
        }

        return {
            text: { value: action.text },
            recipients: { value: getRecipients(action) },
            valid: true
        };
    }

    return {
        text: { value: '' },
        recipients: { value: [] },
        valid: false
    };
};

export const stateToAction = (
    settings: NodeEditorSettings,
    formState: SendBroadcastFormState
): BroadcastMsg => {
    return {
        contacts: this.getAsset(formState.recipients.value, AssetType.Contact),
        groups: this.getAsset(formState.recipients.value, AssetType.Group),
        text: formState.text.value,
        type: Types.send_broadcast,
        uuid: getActionUUID(settings, Types.send_broadcast)
    };
};

export const getAsset = (assets: Asset[], type: AssetType): any[] => {
    return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
        return { uuid: asset.id, name: asset.name };
    });
};
