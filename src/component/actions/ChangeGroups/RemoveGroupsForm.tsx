import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import { ChangeGroups } from '../../../flowTypes';
import { AppState } from '../../../store';
import { SearchResult } from '../../../store';
import { jsonEqual } from '../../../utils';
import CheckboxElement from '../../form/CheckboxElement';
import GroupsElement from '../../form/GroupsElement';
import { AddGroupsFormState } from './AddGroupsForm';
import ChangeGroupsFormProps from './props';

export interface RemoveGroupsFormState extends AddGroupsFormState {
    removeFromAll: boolean;
}

export const LABEL = 'Select the group(s) to remove the contact from.';
export const NOT_FOUND = 'Enter the name of an existing group';
export const PLACEHOLDER = 'Enter the name an existing group';
export const REMOVE_FROM_ALL = 'Remove from All';
export const REMOVE_FROM_ALL_DESC =
    "Remove the active contact from all groups they're a member of.";

export class RemoveGroupsForm extends React.PureComponent<
    ChangeGroupsFormProps,
    RemoveGroupsFormState
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);

        const groups: SearchResult[] = this.getGroups();
        const removeFromAll: boolean = this.props.action.groups && !this.props.action.groups.length;

        this.state = {
            groups,
            removeFromAll
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

    public onCheck(): void {
        this.setState({ removeFromAll: !this.state.removeFromAll });
    }

    public onValid(): void {
        const newAction: ChangeGroups = {
            uuid: this.props.action.uuid,
            type: this.props.typeConfig.type,
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

        if (this.props.action.groups.length && this.props.action.type !== 'add_contact_groups') {
            return this.props.action.groups.map(({ uuid, name }) => ({ name, id: uuid }));
        }

        return [];
    }

    private getFields(): JSX.Element {
        let groupElLabel: JSX.Element = null;
        let groupEl: JSX.Element = null;
        let checkboxEl: JSX.Element = null;

        const sibling = !this.state.removeFromAll;

        if (sibling) {
            groupElLabel = <p>{LABEL}</p>;

            groupEl = (
                <GroupsElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    placeholder={PLACEHOLDER}
                    searchPromptText={NOT_FOUND}
                    endpoint={this.context.endpoints.groups}
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
        return <React.Fragment>{fields}</React.Fragment>;
    }
}

const mapStateToProps = ({ nodeEditor: { typeConfig } }: AppState) => ({ typeConfig });

const ConnectedRemoveGroupForm = connect(mapStateToProps, null, null, { withRef: true })(
    RemoveGroupsForm
);

export default ConnectedRemoveGroupForm;
