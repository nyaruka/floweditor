import { FormHelper, Types } from '../../../config/typeConfigs';
import { AddLabels } from '../../../flowTypes';
import { Asset, AssetType } from '../../../services/AssetService';
import { AddLabelsFormState } from '../../../store/nodeEditor';

export class AddLabelsFormHelper implements FormHelper {
    public actionToState(action: AddLabels): AddLabelsFormState {
        if (action) {
            return {
                type: action.type,
                labels: {
                    value: action.labels.map(label => {
                        return { id: label.uuid, name: label.name, type: AssetType.Label };
                    })
                },
                valid: true
            };
        }

        return {
            type: Types.add_input_labels,
            labels: { value: [] },
            valid: false
        };
    }

    public stateToAction(actionUUID: string, formState: AddLabelsFormState): AddLabels {
        return {
            labels: this.getAsset(formState.labels.value, AssetType.Label),
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
