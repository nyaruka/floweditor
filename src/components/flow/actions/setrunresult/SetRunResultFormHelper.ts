import { FormHelper, Types } from '~/config/typeConfigs';
import { SetRunResult } from '~/flowTypes';
import { SetRunResultFormState, NodeEditorSettings } from '~/store/nodeEditor';

export class SetRunResultFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): SetRunResultFormState {
        if (settings.originalAction) {
            const action = settings.originalAction as SetRunResult;

            return {
                type: action.type,
                name: { value: action.name },
                value: { value: action.value },
                category: { value: action.category },
                valid: true
            };
        }

        return {
            type: Types.set_run_result,
            name: { value: '' },
            value: { value: '' },
            category: { value: '' },
            valid: false
        };
    }

    public stateToAction(uuid: string, state: SetRunResultFormState): SetRunResult {
        return {
            type: state.type,
            name: state.name.value,
            value: state.value.value,
            category: state.category.value,
            uuid
        };
    }
}
