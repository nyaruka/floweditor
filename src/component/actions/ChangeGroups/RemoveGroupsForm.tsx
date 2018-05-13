import { react as bindCallbacks } from 'auto-bind';
import * as isEqual from 'fast-deep-equal';
import * as React from 'react';

import { ConfigProviderContext } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { Types } from '../../../config/typeConfigs';
import { ChangeGroups } from '../../../flowTypes';
import { Asset } from '../../../services/AssetService';
import CheckboxElement from '../../form/CheckboxElement';
import GroupsElement from '../../form/GroupsElement';
import { mapAssetsToGroups, mapGroupsToAssets } from './helpers';
import ChangeGroupsFormProps from './props';

export interface RemoveGroupsFormState {
    groups: Asset[];
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

// NOTE: unlike its sibling, this component has to keep group state
// because we lose track of our Groups ref if the 'Remove from all' setting is checked.
export default class RemoveGroupsForm extends React.Component<
    ChangeGroupsFormProps,
    RemoveGroupsFormState
> {
    public static contextTypes = {
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
            include: [/^on/, /^handle/]
        });
    }

    private onGroupsChanged(groups: Asset[]): void {
        if (!isEqual(groups, this.state.groups)) {
            this.setState({
                groups
            });
        }
    }

    public validate(): boolean {
        return true;
    }

    public handleUpdateRemoveAll(checked: boolean): void {
        this.setState({ removeFromAll: checked });
    }

    public onValid(): void {
        const newAction: ChangeGroups = {
            uuid: this.props.action.uuid,
            type: Types.remove_contact_groups,
            groups: []
        };

        if (!this.state.removeFromAll) {
            newAction.groups = mapAssetsToGroups(this.state.groups);
        }

        this.props.updateAction(newAction);
    }

    private getGroups(): Asset[] {
        if (
            this.props.action.groups &&
            this.props.action.groups.length &&
            this.props.action.type !== Types.add_contact_groups
        ) {
            return mapGroupsToAssets(this.props.action.groups);
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
                    name="Groups"
                    placeholder={PLACEHOLDER}
                    searchPromptText={NOT_FOUND}
                    assets={this.context.assetService.getGroupAssets()}
                    groups={this.state.groups}
                    add={false}
                    onChange={this.onGroupsChanged}
                />
            );
        }

        checkboxEl = (
            <CheckboxElement
                name={REMOVE_FROM_ALL}
                defaultValue={this.state.removeFromAll}
                description={REMOVE_FROM_ALL_DESC}
                sibling={sibling}
                onChange={this.handleUpdateRemoveAll}
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
