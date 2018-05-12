import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import { ConfigProviderContext } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { Types } from '../../../config/typeConfigs';
import { ChangeGroups } from '../../../flowTypes';
import AssetService, { Asset } from '../../../services/AssetService';
import GroupsElement from '../../form/GroupsElement';
import { mapAssetsToGroups, mapGroupsToAssets } from './helpers';
import ChangeGroupsFormProps from './props';

export const LABEL = ' Select the group(s) to add the contact to.';
export const PLACEHOLDER = 'Enter the name of an existing group or create a new one';

export const labelSpecId = 'label';

export default class AddGroupsForm extends React.Component<ChangeGroupsFormProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { groups } } = widgets.Groups;
        const newAction: ChangeGroups = {
            uuid: this.props.action.uuid,
            type: Types.add_contact_groups,
            groups: mapAssetsToGroups(groups)
        };

        this.props.updateAction(newAction);
    }

    private getGroups(): Asset[] {
        if (
            this.props.action.groups &&
            this.props.action.groups.length &&
            this.props.action.type !== Types.remove_contact_groups
        ) {
            return mapGroupsToAssets(this.props.action.groups);
        }
        return [];
    }

    public render(): JSX.Element {
        return (
            <>
                <p data-spec={labelSpecId}>{LABEL}</p>
                <GroupsElement
                    ref={this.props.onBindWidget}
                    name="Groups"
                    placeholder={PLACEHOLDER}
                    assets={this.context.assetService.getGroupAssets()}
                    groups={this.getGroups()}
                    add={true}
                />
            </>
        );
    }
}
