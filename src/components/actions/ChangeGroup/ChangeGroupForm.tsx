import * as React from 'react';
import { GroupElement } from '../../form/GroupElement';
import { IChangeGroup } from '../../../flowTypes';
import NodeActionForm from '../../NodeEditor/NodeActionForm';
import Widget from '../../NodeEditor/Widget';

class ChangeGroupForm extends NodeActionForm<IChangeGroup> {
    renderForm(ref: any): JSX.Element {
        var action = this.getInitial();
        var groups: { group: string; name: string }[] = [];

        if (action && (action.type == 'add_to_group' || action.type == 'remove_from_group')) {
            if (action.groups) {
                groups.push({ group: action.groups[0].uuid, name: action.groups[0].name });
            }
        }

        return (
            <div>
                <p>Select the group(s) to add the contact to.</p>
                <GroupElement
                    ref={ref}
                    name="Group"
                    endpoint={this.props.endpoints.groups}
                    localGroups={this.props.ComponentMap.getGroups()}
                    groups={groups}
                    add={this.props.config.type == 'add_to_group'}
                    required
                />
            </div>
        );
    }

    onValid(widgets: { [name: string]: Widget }) {
        var groupEle = widgets['Group'] as any;
        var group = groupEle.state.groups[0];

        if (group) {
            var newAction: IChangeGroup = {
                uuid: this.getActionUUID(),
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
}

export default ChangeGroupForm;
