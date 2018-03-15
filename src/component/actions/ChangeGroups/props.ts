import { ChangeGroups } from '../../../flowTypes';
import { Type } from '../../../config';
import ComponentMap from '../../../services/ComponentMap';

export default interface ChangeGroupFormProps {
    action: ChangeGroups;
    config: Type;
    updateAction: (action: ChangeGroups) => void;
    onBindWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
    ComponentMap: ComponentMap;
};
