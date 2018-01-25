import * as React from 'react';
import { ChangeGroup, Endpoints } from '../../../flowTypes';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import GroupElement, { GROUP_TYPE } from '../../form/GroupElement';
import { endpointsPT } from '../../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../../providers/ConfigProvider/configContext';

export interface ChangeGroupFormProps {
    action: ChangeGroup;
    getActionUUID: () => string;
    config: Type;
    updateAction: (action: ChangeGroup) => void;
    onBindWidget: (ref: any) => void;
    ComponentMap: ComponentMap;
}

export default class ChangeGroupForm extends React.PureComponent<ChangeGroupFormProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupFormProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const groupEle = widgets.Group as any;
        const { state: { groups: [group] } } = groupEle;

        if (group) {
            const newAction: ChangeGroup = {
                uuid: this.props.getActionUUID(),
                type: this.props.config.type,
                groups: [
                    {
                        uuid: group.id,
                        name: group.name
                    }
                ]
            };

            this.props.updateAction(newAction);
        }
    }

    public render(): JSX.Element {
        let p: JSX.Element = null;

        if (this.props.config.type === 'add_to_group') {
            p = <p>Select the group(s) to add the contact to.</p>;
        } else if (this.props.config.type === 'remove_from_group') {
            p = <p>Select the group(s) to remove the contact from.</p>;
        }

        const groups: SearchResult[] = [];

        if (
            this.props.action &&
            (this.props.action.type === 'add_to_group' ||
                this.props.action.type === 'remove_from_group')
        ) {
            if (this.props.action.groups) {
                const { groups: [{ uuid, name }] } = this.props.action;

                groups.push({ name, id: uuid, type: GROUP_TYPE });
            }
        }

        const localGroups: SearchResult[] = this.props.ComponentMap.getGroups();

        const add: boolean = this.props.config.type === 'add_to_group';

        return (
            <div>
                {p}
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    endpoint={this.context.endpoints.groups}
                    localGroups={localGroups}
                    groups={groups}
                    add={add}
                    required={true}
                />
            </div>
        );
    }
}
