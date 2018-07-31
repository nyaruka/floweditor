import { Types } from '~/config/typeConfigs';
import { SetRunResult } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

import { SetRunResultFormState } from './SetRunResultForm';

export const initializeForm = (settings: NodeEditorSettings): SetRunResultFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.set_run_result) {
        const action = settings.originalAction as SetRunResult;

        return {
            name: { value: action.name },
            value: { value: action.value },
            category: { value: action.category },
            valid: true
        };
    }

    return {
        name: { value: '' },
        value: { value: '' },
        category: { value: '' },
        valid: false
    };
};

export const stateToAction = (uuid: string, state: SetRunResultFormState): SetRunResult => {
    return {
        type: Types.set_run_result,
        name: state.name.value,
        value: state.value.value,
        category: state.category.value,
        uuid
    };
};
