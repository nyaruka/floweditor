import { ActionFormHelper, Type } from '~/config/typeConfigs';
import { ChangeGroups } from '~/flowTypes';
import { NodeEditorSettings } from '~/store/nodeEditor';

export interface ChangeGroupsFormProps {
    // action details
    nodeSettings: NodeEditorSettings;
    formHelper: ActionFormHelper;
    typeConfig: Type;

    // update handlers
    updateAction(action: ChangeGroups): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}
export default ChangeGroupsFormProps;
