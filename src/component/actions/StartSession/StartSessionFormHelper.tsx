import { FormHelper, Types } from '../../../config/typeConfigs';
import { StartSession } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { StartSessionFormState } from '../../../store/nodeEditor';
import { getRecipients } from '../helpers';

export class StartSessionFormHelper implements FormHelper {
    public actionToState(action: StartSession): StartSessionFormState {
        if (action) {
            return {
                type: action.type,
                recipients: getRecipients(action),
                flow: { id: action.flow.uuid, name: action.flow.name, type: AssetType.Flow },
                valid: true
            };
        }

        return {
            type: Types.start_session,
            recipients: [],
            flow: null,
            valid: false
        };
    }

    public stateToAction(uuid: string, state: StartSessionFormState): StartSession {
        return {
            contacts: this.getRecipients(state.recipients, AssetType.Contact),
            groups: this.getRecipients(state.recipients, AssetType.Group),
            flow: { name: state.flow.name, uuid: state.flow.id },
            type: state.type,
            uuid
        };
    }

    private getRecipients(assets: Asset[], type: AssetType): any[] {
        return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
            return { uuid: asset.id, name: asset.name };
        });
    }
}
