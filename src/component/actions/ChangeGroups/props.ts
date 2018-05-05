import { ChangeGroups } from '../../../flowTypes';
import { Asset } from '../../../services/AssetService';

export default interface ChangeGroupFormProps {
    action: ChangeGroups;
    updateAction: (action: ChangeGroups) => void;
    onBindWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
    groups: Asset[];
};
