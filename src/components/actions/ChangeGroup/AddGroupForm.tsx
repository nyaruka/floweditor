import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import ChangeGroupFormProps from './groupFormPropTypes';
import { ChangeGroup, Endpoints } from '../../../flowTypes';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import GroupElement, { GroupList } from '../../form/GroupElement';
import CheckboxElement from '../../form/CheckboxElement';
import { endpointsPT } from '../../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../../providers/ConfigProvider/configContext';
import { Widgets } from '../../NodeEditor/NodeEditor';

export const label: string = ' Select the group(s) to add the contact to.';
export const notFound: string = 'Invalid group name';
export const placeholder: string =
    'Enter the name of an existing group, or create a new group to add the contact to';

export default class AddGroupForm extends React.PureComponent<ChangeGroupFormProps, {}> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupFormProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: Widgets): void {
        const groupEle = widgets.Group as GroupElement;
        const { state: { groups } } = groupEle;

        const newAction: ChangeGroup = {
            uuid: this.props.action.uuid,
            type: this.props.config.type,
            groups: groups.map((group: SearchResult) => ({
                uuid: group.id,
                name: group.name
            }))
        };

        this.props.updateAction(newAction);
    }

    private getGroups(): GroupList {
        if (this.props.action.groups == null) {
            return [];
        }

        if (this.props.action.groups.length && this.props.action.type !== 'remove_from_group') {
            return this.props.action.groups.map(
                ({ uuid: group, name }) => ({
                    group,
                    name
                }),
                []
            );
        }

        return [];
    }

    public render(): JSX.Element {
        const localGroups: SearchResult[] = this.props.ComponentMap.getGroups();
        const groups: GroupList = this.getGroups();
        return (
            <div>
                <p>{label}</p>
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    placeholder={placeholder}
                    searchPromptText={notFound}
                    endpoint={this.context.endpoints.groups}
                    localGroups={localGroups}
                    groups={groups}
                    add={true}
                    required={true}
                />
            </div>
        );
    }
}
