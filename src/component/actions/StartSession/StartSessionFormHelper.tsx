import { FormHelper, Types } from '../../../config/typeConfigs';
import { StartSession } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { StartSessionFormState, NodeEditorSettings } from '../../../store/nodeEditor';
import { getRecipients } from '../helpers';

export class StartSessionFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): StartSessionFormState {
        if (settings.originalAction) {
            const action = settings.originalAction as StartSession;
            return {
                type: action.type,
                recipients: { value: getRecipients(action) },
                flow: {
                    value: { id: action.flow.uuid, name: action.flow.name, type: AssetType.Flow }
                },
                valid: true
            };
        }

        return {
            type: Types.start_session,
            recipients: { value: [] },
            flow: { value: null },
            valid: false
        };
    }

    public stateToAction(uuid: string, form: StartSessionFormState): StartSession {
        const flow: Asset = form.flow.value;

        return {
            contacts: this.getRecipients(form.recipients.value, AssetType.Contact),
            groups: this.getRecipients(form.recipients.value, AssetType.Group),
            flow: { name: flow.name, uuid: flow.id },
            type: form.type,
            uuid
        };
    }

    private getRecipients(assets: Asset[], type: AssetType): any[] {
        return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
            return { uuid: asset.id, name: asset.name };
        });
    }
}
