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
import GroupFormState from './groupFormState';

export interface AddGroupFormState extends GroupFormState {
    hasAddAction: boolean;
}

export const label: string = ' Select the group(s) to add the contact to.';
export const notFound: string = 'Invalid group name';
export const placeholder: string =
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

        const fromRouter: boolean = !this.props.action;

        // Does this node have an existing action? If so, is it a 'add_to_group' action?
        const hasAddAction: boolean = this.hasAddAction();

        this.state = {
            fromRouter,
            hasAddAction
        };

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: Widgets): void {
        const groupEle = widgets.Group as GroupElement;
        const { state: { groups } } = groupEle;

        const uuid: string = this.state.fromRouter ? generateUUID() : this.props.action.uuid;

        const newAction: ChangeGroup = {
            uuid,
            type: this.props.config.type,
            groups: groups.map((group: SearchResult) => ({
                uuid: group.id,
                name: group.name
            }))
        };

        this.props.updateAction(newAction);
    }

    private hasAddAction(): boolean {
        if (!this.props.action) {
            return false;
        } else {
            if (this.props.action.type === 'add_to_group') {
                return true;
            }
            return false;
        }
    }

    private getGroups(): GroupList {
        if (this.state.hasAddAction) {
            if (this.props.action.groups == null) {
                return [];
            }

            if (this.props.action.groups.length) {
                return this.props.action.groups.map(
                    ({ uuid: group, name }) => ({
                        group,
                        name
                    }),
                    []
                );
            }
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
