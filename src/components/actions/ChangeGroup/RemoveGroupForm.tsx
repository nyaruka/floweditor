import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import ChangeGroupFormProps from './groupFormPropTypes';
import { ChangeGroup, Endpoints } from '../../../flowTypes';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import GroupElement from '../../form/GroupElement';
import CheckboxElement from '../../form/CheckboxElement';
import { endpointsPT } from '../../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../../providers/ConfigProvider/configContext';
import { jsonEqual } from '../../../helpers/utils';
import { AddGroupFormState } from './AddGroupForm';

export interface RemoveGroupFormState extends AddGroupFormState {
    removeFromAll: boolean;
}

export const LABEL: string = 'Select the group(s) to remove the contact from.';
export const NOT_FOUND: string = 'Enter the name of an existing group';
export const PLACEHOLDER: string = 'Enter the name an existing group';
export const REMOVE_FROM_ALL: string = 'Remove from All';
export const REMOVE_FROM_ALL_DESC: string =
    "Remove the active contact from all groups they're a member of.";

export default class RemoveGroupForm extends React.PureComponent<
    ChangeGroupFormProps,
    RemoveGroupFormState
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupFormProps, context: ConfigProviderContext) {
        super(props);

        const groups: SearchResult[] = this.getGroups();
        const removeFromAll: boolean = this.props.action.groups && !this.props.action.groups.length;

        this.state = {
            groups,
            removeFromAll
        };

        this.onGroupsChanged = this.onGroupsChanged.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.onValid = this.onValid.bind(this);
    }

    private onGroupsChanged(groups: SearchResult[]): void {
        if (!jsonEqual(groups, this.state.groups)) {
            this.setState({
                groups
            });
        }
    }

    private onCheck(): void {
        this.setState({ removeFromAll: !this.state.removeFromAll }, () => console.log('state set'));
    }

    public onValid(): void {
        const newAction: ChangeGroup = {
            uuid: this.props.action.uuid,
            type: this.props.config.type,
            groups: []
        };

        if (!this.state.removeFromAll) {
            if (this.state.groups.length) {
                newAction.groups = this.state.groups.map((group: SearchResult) => ({
                    uuid: group.id,
                    name: group.name
                }));
            }
        }

        this.props.updateAction(newAction);
    }

    private getGroups(): SearchResult[] {
        if (this.props.action.groups == null) {
            return [];
        }

        if (this.props.action.groups.length && this.props.action.type !== 'add_to_group') {
            return this.props.action.groups.map(({ uuid, name }) => ({ name, id: uuid }));
        }

        return [];
    }

    private getFields(): JSX.Element {
        let groupElLabel: JSX.Element = null;
        let groupEl: JSX.Element = null;
        let checkboxEl: JSX.Element = null;

        const sibling: boolean = !this.state.removeFromAll;
        const localGroups: SearchResult[] = this.props.ComponentMap.getGroups();

        if (sibling) {
            groupElLabel = <p>{LABEL}</p>;

            groupEl = (
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    placeholder={PLACEHOLDER}
                    searchPromptText={NOT_FOUND}
                    endpoint={this.context.endpoints.groups}
                    localGroups={localGroups}
                    groups={this.state.groups}
                    add={false}
                    required={true}
                    onChange={this.onGroupsChanged}
                />
            );
        } else {
            this.props.removeWidget('Group');
        }

        checkboxEl = (
            <CheckboxElement
                ref={this.props.onBindWidget}
                name={REMOVE_FROM_ALL}
                defaultValue={this.state.removeFromAll}
                description={REMOVE_FROM_ALL_DESC}
                sibling={sibling}
                onCheck={this.onCheck}
            />
        );

        return (
            <div data-spec="field-container">
                {groupElLabel}
                {groupEl}
                {checkboxEl}
            </div>
        );
    }

    public render(): JSX.Element {
        const fields: JSX.Element = this.getFields();
        return <div>{fields}</div>;
    }
}
