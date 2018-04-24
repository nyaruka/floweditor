import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import * as isEqual from 'fast-deep-equal';
import { connect } from 'react-redux';
import { ConfigProviderContext, fakePropType } from '../../../config';
import { ChangeGroups } from '../../../flowTypes';
import { AppState, SearchResult } from '../../../store';
import CheckboxElement from '../../form/CheckboxElement';
import GroupsElement from '../../form/GroupsElement';
import { AddGroupsFormState } from './AddGroupsForm';
import { mapGroupsToSearchResults, mapSearchResultsToGroups } from './helpers';
import ChangeGroupsFormProps from './props';
import { Types } from '../../../config/typeConfigs';

export interface RemoveGroupsFormState extends AddGroupsFormState {
    removeFromAll: boolean;
}

export const LABEL = 'Select the group(s) to remove the contact from.';
export const NOT_FOUND = 'Enter the name of an existing group';
export const PLACEHOLDER = 'Enter the name an existing group';
export const REMOVE_FROM_ALL = 'Remove from All';
export const REMOVE_FROM_ALL_DESC =
    "Remove the active contact from all groups they're a member of.";

export const labelSpecId = 'label';
export const fieldContainerSpecId = 'field-container';

export class RemoveGroupsForm extends React.Component<
    ChangeGroupsFormProps,
    RemoveGroupsFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);

        const groups = this.getGroups();
        const removeFromAll = this.props.action.groups && !this.props.action.groups.length;

        this.state = {
            groups,
            removeFromAll
        };

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    private onGroupsChanged(groups: SearchResult[]): void {
        if (!isEqual(groups, this.state.groups)) {
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
            newAction.groups = mapSearchResultsToGroups(this.state.groups);
        }

        this.props.updateAction(newAction);
    }

    private getGroups(): SearchResult[] {
        if (
            this.props.action.groups &&
            this.props.action.groups.length &&
            this.props.action.type !== Types.add_contact_groups
        ) {
            return mapGroupsToSearchResults(this.props.action.groups);
        }
        return [];
    }

    private getFields(): JSX.Element {
        let groupElLabel: JSX.Element = null;
        let groupEl: JSX.Element = null;
        let checkboxEl: JSX.Element = null;
        const sibling = !this.state.removeFromAll;

        if (sibling) {
            groupElLabel = <p data-spec={labelSpecId}>{LABEL}</p>;

            groupEl = (
                <GroupsElement
                    ref={this.props.onBindWidget}
                    name="Groups"
                    placeholder={PLACEHOLDER}
                    searchPromptText={NOT_FOUND}
                    assets={this.context.assetService.getGroupAssets()}
                    groups={this.state.groups}
                    add={false}
                    required={true}
                    onChange={this.onGroupsChanged}
                />
            );
        } else {
            this.props.removeWidget('Groups');
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
            <>
                {groupElLabel}
                {groupEl}
                {checkboxEl}
            </>
        );
    }

    public render(): JSX.Element {
        const fields = this.getFields();
        return <>{fields}</>;
    }
}

/* istanbul ignore next */
const mapStateToProps = ({ flowContext: { groups }, nodeEditor: { typeConfig } }: AppState) => ({
    groups,
    typeConfig
});

const ConnectedRemoveGroupForm = connect(mapStateToProps, null, null, { withRef: true })(
    RemoveGroupsForm
);

export default ConnectedRemoveGroupForm;
