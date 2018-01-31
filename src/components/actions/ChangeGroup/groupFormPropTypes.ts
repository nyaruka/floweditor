import { ChangeGroup } from '../../../flowTypes';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import ComponentMap from '../../../services/ComponentMap';

export default interface ChangeGroupFormProps {
    action: ChangeGroup;
    config: Type;
    updateAction: (action: ChangeGroup) => void;
    onBindWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
    ComponentMap: ComponentMap;
}
