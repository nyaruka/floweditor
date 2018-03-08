import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import ChangeGroupFormProps from './props';
import { ChangeGroup, Endpoints } from '../../../flowTypes';
import { SearchResult } from '../../../services/ComponentMap';
import GroupElement from '../../form/GroupElement';
import CheckboxElement from '../../form/CheckboxElement';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import { jsonEqual } from '../../../utils';

export interface AddGroupFormState {
    groups: SearchResult[];
}

export const LABEL = ' Select the group(s) to add the contact to.';
export const PLACEHOLDER =
    'Enter the name of an existing group, or create a new group to add the contact to';

export default class AddGroupForm extends React.PureComponent<
    ChangeGroupFormProps,
    AddGroupFormState
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupFormProps, context: ConfigProviderContext) {
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

    private getGroups(): SearchResult[] {
        if (this.props.action.groups == null) {
            return [];
        }

        if (this.props.action.groups.length && this.props.action.type !== 'remove_from_group') {
            return this.props.action.groups.map(({ uuid, name }) => ({
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
                <GroupElement
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
