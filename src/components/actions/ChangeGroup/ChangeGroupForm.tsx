import * as React from 'react';
import { ChangeGroup, Endpoints } from '../../../flowTypes';
import { Type } from '../../../providers/typeConfigs';
import ComponentMap from '../../../services/ComponentMap';
import GroupElement from '../../form/GroupElement';
import { endpointsPT } from '../../../providers/propTypes';
import { ConfigProviderContext } from '../../../providers/ConfigProvider';

export interface ChangeGroupFormProps {
    action: ChangeGroup;
    getActionUUID: Function;
    config: Type;
    updateAction(action: ChangeGroup): void;
    onBindWidget(ref: any): void;
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
        const groupEle = widgets['Group'] as any;
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

    private renderForm(): JSX.Element {
        const groups: { group: string; name: string }[] = [];
        let p: JSX.Element;

        if (this.props.config.type === 'add_to_group') {
            p = <p>Select the group(s) to add the contact to.</p>;
        } else if (this.props.config.type === 'remove_from_group') {
            p = <p>Select the group(s) to remove the contact from.</p>;
        } else {
            p = null;
        }

        if (
            this.props.action &&
            (this.props.action.type === 'add_to_group' ||
                this.props.action.type === 'remove_from_group')
        ) {
            if (this.props.action.groups) {
                const { groups: [{ uuid: group, name }] } = this.props.action;
                groups.push({ group, name });
            }
        }

        return (
            <div>
                {p}
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    endpoint={this.context.endpoints.groups}
                    localGroups={this.props.ComponentMap.getGroups()}
                    groups={groups}
                    add={this.props.config.type === 'add_to_group'}
                    required
                />
            </div>
        );
    }

    public render(): JSX.Element {
        return this.renderForm();
    }
}
