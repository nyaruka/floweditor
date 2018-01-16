import { ChangeGroup } from '../../../flowTypes';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import { Widget } from '../../NodeEditor/NodeEditor';
import ComponentMap from '../../../services/ComponentMap';

export default interface ChangeGroupFormProps {
    action: ChangeGroup;
    config: Type;
    updateAction(action: ChangeGroup): void;
    onBindWidget(ref: Widget): void;
    removeWidget(name: string): void;
    ComponentMap: ComponentMap;
}
