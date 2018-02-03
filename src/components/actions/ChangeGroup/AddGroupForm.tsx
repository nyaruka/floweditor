import * as React from 'react';
import { substArr } from '@ycleptkellan/substantive';
import { v4 as generateUUID } from 'uuid';
import ChangeGroupFormProps from './groupFormPropTypes';
import { ChangeGroup, Endpoints, Group } from '../../../flowTypes';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import GroupElement from '../../form/GroupElement';
import CheckboxElement from '../../form/CheckboxElement';
import { endpointsPT } from '../../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../../providers/ConfigProvider/configContext';
import { jsonEqual } from '../../../helpers/utils';

export interface AddGroupFormState {
    groups: SearchResult[];
}

export const LABEL = ' Select the group(s) to add the contact to.';
export const NOT_FOUND = 'Invalid group name';
export const PLACEHOLDER =
    'Enter the name of an existing group, or create a new one...';

export const transformGroups = (groups: Group[]): SearchResult[] =>
    groups.map(({ name, uuid }) => ({ name, id: uuid }));

export const getGroupsState = (
    { action: { type, groups } }: ChangeGroupFormProps,
    addForm: boolean = false
): SearchResult[] => {
    if (!substArr(groups)) {
        return [];
    }

    if (type !== (addForm ? 'remove_from_group' : 'add_to_group')) {
        return transformGroups(groups);
    }

    return [];
};

export const getLocalGroups = (
    { node, ComponentMap: { getGroups } }: ChangeGroupFormProps,
    addForm: boolean = false
): SearchResult[] => {
    if (substArr(node.actions)) {
        for (const { type } of node.actions) {
            if (type === (addForm ? 'remove_from_group' : 'add_to_group')) {
                return [];
            }
        }
    }

    return getGroups();
};

export default class AddGroupForm extends React.PureComponent<
    ChangeGroupFormProps,
    AddGroupFormState
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupFormProps, context: ConfigProviderContext) {
        super(props);

        const groups = getGroupsState(props, true);

        this.state = {
            groups
        };

        this.onGroupsChanged = this.onGroupsChanged.bind(this);
        this.onValid = this.onValid.bind(this);
    }

    private onGroupsChanged(groups: SearchResult[]): void {
        if (!jsonEqual(groups, this.state.groups)) {
            this.setState({
                groups
            });
        }
    }

    public onValid(): void {
        const newAction: ChangeGroup = {
            uuid: this.props.action.uuid,
            type: this.props.config.type,
            groups: this.state.groups.map((group: SearchResult) => ({
                uuid: group.id,
                name: group.name
            }))
        };

        this.props.updateAction(newAction);
    }

    public render(): JSX.Element {
        const localGroups = getLocalGroups(this.props, true);
        return (
            <>
                <p>{LABEL}</p>
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    placeholder={PLACEHOLDER}
                    searchPromptText={NOT_FOUND}
                    endpoint={this.context.endpoints.groups}
                    localGroups={localGroups}
                    groups={this.state.groups}
                    add={true}
                    required={true}
                    onChange={this.onGroupsChanged}
                />
            </>
        );
    }
}
