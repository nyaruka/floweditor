import * as React from 'react';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import { ChangeGroups, Group } from '../../../flowTypes';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import { jsonEqual } from '../../../utils';
import GroupsElement from '../../form/GroupsElement';
import ChangeGroupsFormProps from './props';

export interface AddGroupFormState {
    groups: SearchResult[];
}

export const LABEL = ' Select the group(s) to add the contact to.';
export const PLACEHOLDER =
    'Enter the name of an existing group or create a new one';

export default class AddGroupForm extends React.PureComponent<
    ChangeGroupsFormProps,
    AddGroupFormState
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);

        const groups: SearchResult[] = this.getGroups();

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
        const newAction: ChangeGroups = {
            uuid: this.props.action.uuid,
            type: this.props.config.type,
            groups: this.state.groups.map((group: SearchResult) => ({
                uuid: group.id,
                name: group.name
            }))
        };

        this.props.updateAction(newAction);
    }

    private getGroups(): SearchResult[] {
        if (this.props.action.groups == null) {
            return [];
        }

        if (this.props.action.groups.length && this.props.action.type !== 'remove_contact_groups') {
            return this.props.action.groups.map(({ uuid, name }: Group) => ({
                name,
                id: uuid
            }));
        }

        return [];
    }

    public render(): JSX.Element {
        return (
            <React.Fragment>
                <p>{LABEL}</p>
                <GroupsElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    placeholder={PLACEHOLDER}
                    endpoint={this.context.endpoints.groups}
                    groups={this.state.groups}
                    add={true}
                    required={true}
                    onChange={this.onGroupsChanged}
                />
            </React.Fragment>
        );
    }
}
