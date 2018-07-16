import { FormHelper, Types } from '~/config/typeConfigs';
import { NodeEditorSettings, SwitchRouterFormState } from '~/store/nodeEditor';

export class SwitchRouterFormHelper implements FormHelper {
    public initializeForm(settings: NodeEditorSettings): SwitchRouterFormState {
        return { type: Types.wait_for_response, valid: true };
    }
}
