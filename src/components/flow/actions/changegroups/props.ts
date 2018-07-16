import { ActionFormHelper } from '~/config/typeConfigs';
import { ChangeGroups } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { ChangeGroupsFunc } from '~/store/forms';
import { ChangeGroupsFormState } from '~/store/nodeEditor';

export interface ChangeGroupsStoreProps {
    form: ChangeGroupsFormState;
    updateChangeGroupsForm: ChangeGroupsFunc;
}

export interface ChangeGroupsPassedProps {
    action: ChangeGroups;
    updateAction: (action: ChangeGroups) => void;
    groups: Asset[];
    formHelper: ActionFormHelper;
}

export type ChangeGroupsFormProps = ChangeGroupsPassedProps & ChangeGroupsStoreProps;

export default ChangeGroupsFormProps;
