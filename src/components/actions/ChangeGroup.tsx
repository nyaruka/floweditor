import * as React from 'react';
import * as UUID from 'uuid';
import { ActionComp, ActionProps } from '../Action';
import { SearchResult, ComponentMap } from '../ComponentMap';
import { GroupElement } from '../form/GroupElement';
import { ChangeGroup } from '../../FlowDefinition';
import { NodeActionForm, Widget } from "../NodeEditor";
import { Config } from "../../services/Config";


export class ChangeGroupComp extends ActionComp<ChangeGroup> {
    renderNode() { return <div>{this.getAction().groups[0].name}</div> }
}

export class ChangeGroupForm extends NodeActionForm<ChangeGroup> {

    renderForm(ref: any): JSX.Element {
        var action = this.getInitial();
        var groups: { group: string, name: string }[] = [];

        if (action && (action.type == "add_to_group" || action.type == "remove_from_group")) {
            if (action.groups) {
                groups.push({ group: action.groups[0].uuid, name: action.groups[0].name });
            }
        }

        return (
            <div>
                <p>Select the groups to add the contact to.</p>
                <GroupElement
                    ref={ref}
                    name="Group"
                    endpoint={Config.get().endpoints.groups}
                    localGroups={ComponentMap.get().getGroups()}
                    groups={groups}
                    add={this.props.config.type == "add_to_group"}
                    required
                />
            </div>
        )
    }

    onValid(widgets: { [name: string]: Widget }) {

        var groupEle = widgets["Group"] as any;
        var group = groupEle.state.groups[0];

        if (group) {

            var newAction: ChangeGroup = {
                uuid: this.getActionUUID(),
                type: this.props.config.type,
                groups: [{
                    uuid: group.id,
                    name: group.name,
                }]
            }

            this.props.updateAction(newAction);
        }
    }
}