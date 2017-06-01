import * as React from 'react';
import * as UUID from 'uuid';
import { ActionComp } from '../Action';
import { NodeForm } from '../NodeForm';
import { NodeModalProps } from '../NodeModal';
import { ChangeGroupProps, NodeEditorState, SearchResult } from '../../interfaces';
import { GroupElement } from '../form/GroupElement';

export class ChangeGroup extends ActionComp<ChangeGroupProps> {
    renderNode() { return <div>{this.props.groups[0].name}</div> }
}

export class ChangeGroupForm extends NodeForm<ChangeGroupProps, NodeEditorState> {

    renderForm(): JSX.Element {

        var groups: { group: string, name: string }[] = [];
        if (this.props.groups) {
            groups.push({ group: this.props.groups[0].uuid, name: this.props.groups[0].name });
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
                    add={this.props.config.type == "add_to_group"}
                    required
                />
            </div>
        )
    }

    submit(modal: NodeModalProps) {

        var groupEle = this.getElements()[0];
        var group = groupEle.state.groups[0];

        if (group) {
            modal.onUpdateAction({
                uuid: this.props.uuid,
                type: this.props.config.type,
                groups: [{
                    uuid: group.id,
                    name: group.name,
                }]
            } as ChangeGroupProps);

            if (group.extraResult) {
                this.props.context.eventHandler.onAddGroup({
                    id: group.id,
                    name: group.name
                } as SearchResult);
            }
        }
    }
}