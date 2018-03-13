import { ChangeGroups } from '../../../flowTypes';
import { Type } from '../../../config';

export default interface ChangeGroupsFormProps {
    typeConfig: Type;
    action: ChangeGroups;
    updateAction: (action: ChangeGroups) => void;
    onBindWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
};
