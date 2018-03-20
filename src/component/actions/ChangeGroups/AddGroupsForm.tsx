import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import { ChangeGroups, Group } from '../../../flowTypes';
import { ReduxState, SearchResult } from '../../../redux';
import { jsonEqual } from '../../../utils';
import GroupsElement from '../../form/GroupsElement';
import ChangeGroupsFormProps from './props';

export interface AddGroupsFormState {
    groups: SearchResult[];
}

export const LABEL = ' Select the group(s) to add the contact to.';
export const PLACEHOLDER = 'Enter the name of an existing group or create a new one';

export class AddGroupsForm extends React.PureComponent<ChangeGroupsFormProps, AddGroupsFormState> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);

        const groups: SearchResult[] = this.getGroups();

        this.state = {
            groups
        };

        bindCallbacks(this, {
            include: [/^on/]
        });
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
            type: this.props.typeConfig.type,
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

const mapStateToProps = ({ typeConfig }: ReduxState) => ({ typeConfig });

const ConnectedAddGroupForm = connect(mapStateToProps, null, null, { withRef: true })(
    AddGroupsForm
);

export default ConnectedAddGroupForm;
