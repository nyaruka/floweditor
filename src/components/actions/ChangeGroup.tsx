import * as React from 'react';
import * as UUID from 'uuid';
import { ActionComp, ActionProps } from '../Action';
import { ActionForm } from '../NodeForm';
import { NodeModalProps } from '../NodeModal';
import { SearchResult } from '../ComponentMap';
import { GroupElement } from '../form/GroupElement';
import { ChangeGroup } from '../../FlowDefinition';


export class ChangeGroupComp extends ActionComp<ChangeGroup> {
    renderNode() { return <div>{this.getAction().groups[0].name}</div> }
}

export class ChangeGroupForm extends ActionForm<ChangeGroup, {}> {

    renderForm(): JSX.Element {

        var action = this.getAction();

        var groups: { group: string, name: string }[] = [];
        if (action.groups) {
            groups.push({ group: action.groups[0].uuid, name: action.groups[0].name });
        }

        return (
            <div>
                <p>Select the groups to add the contact to.</p>
                <GroupElement
                    ref={this.ref.bind(this)}
                    name="Group"
                    endpoint={this.props.context.endpoints.groups}
                    getLocalGroups={this.props.context.getGroups}
                    groups={groups}
                    add={this.props.action.type == "add_to_group"}
                    required
                />
            </div>
        )
    }

    submit(modal: NodeModalProps) {

        var groupEle = this.getElements()[0];
        var group = groupEle.state.groups[0];

        if (group) {

            var newAction: ChangeGroup = {
                uuid: this.getUUID(),
                type: this.props.config.type,
                groups: [{
                    uuid: group.id,
                    name: group.name,
                }]
            }

            modal.onUpdateAction(newAction);

            if (group.extraResult) {
                this.props.context.eventHandler.onAddGroup({
                    id: group.id,
                    name: group.name
                } as SearchResult);
            }
        }
    }
}