import { ChangeGroups } from '../../../flowTypes';
import { Type } from '../../../config';

export interface ChangeGroupFormPassedProps {
    action: ChangeGroups;
    updateAction: (action: ChangeGroups) => void;
    onBindWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
}

export interface ChangeGroupFormStoreProps {
    typeConfig: Type;
}

type ChangeGroupFormProps = ChangeGroupFormPassedProps & ChangeGroupFormStoreProps;

export default ChangeGroupFormProps;
