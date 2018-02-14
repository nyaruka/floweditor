import { Node, ChangeGroup } from '../../../flowTypes';
import { Type } from '../../../config';
import ComponentMap from '../../../services/ComponentMap';

export default interface ChangeGroupFormProps {
    node: Node;
    action: ChangeGroup;
    config: Type;
    updateAction: (action: ChangeGroup) => void;
    onBindWidget: (ref: any) => void;
    removeWidget: (name: string) => void;
    ComponentMap: ComponentMap;
};
