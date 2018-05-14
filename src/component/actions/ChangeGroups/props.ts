import { FormHelper } from '../../../config/typeConfigs';
import { ChangeGroups } from '../../../flowTypes';
import { Asset } from '../../../services/AssetService';
import { ChangeGroupsFunc } from '../../../store/forms';
import { ChangeGroupsFormState } from '../../../store/nodeEditor';

export interface ChangeGroupsStoreProps {
    form: ChangeGroupsFormState;
    updateChangeGroupsForm: ChangeGroupsFunc;
}

export interface ChangeGroupsPassedProps {
    action: ChangeGroups;
    updateAction: (action: ChangeGroups) => void;
    groups: Asset[];
    formHelper: FormHelper;
}

export type ChangeGroupsFormProps = ChangeGroupsPassedProps & ChangeGroupsStoreProps;

export default ChangeGroupsFormProps;
