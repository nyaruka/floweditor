import * as React from 'react';
import { ChangeGroup } from '../../../flowTypes';
import { Type, Endpoints } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import GroupElement from '../../form/GroupElement';

export interface ChangeGroupFormProps {
    action: ChangeGroup;
    getActionUUID: Function;
    config: Type;
    updateAction(action: ChangeGroup): void;
    onBindWidget(ref: any): void;
    endpoints: Endpoints;
    ComponentMap: ComponentMap;
}

export default class ChangeGroupForm extends React.PureComponent<ChangeGroupFormProps> {
    constructor(props: ChangeGroupFormProps) {
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
        let groups: { group: string; name: string }[] = [];
        let p: JSX.Element;

        if (this.props.config.type === 'add_to_group') {
            p = <p>Select the group(s) to add the contact to.</p>;
        } else if (this.props.config.type === 'remove_from_group') {
            p = <p>Select the group(s) to remove the contact from.</p>
        } else {
            p = null;
        }


        if (
            this.props.action &&
            (this.props.action.type === 'add_to_group' || this.props.action.type === 'remove_from_group')
        ) {
            if (this.props.action.groups) {
                const { groups: [{ uuid: group, name }] } = this.props.action;
                groups = [
                    ...groups,
                    { group, name }
                ];
            }
        }

        return (
            <div>
                { p }
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    endpoint={this.props.endpoints.groups}
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
};
