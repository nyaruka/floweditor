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

export interface RemoveGroupFormState extends GroupFormState {
    hasRemoveAction: boolean;
    removeFromAll: boolean;
}

export const label: string = 'Select the group(s) to remove the contact from.';
export const notFound: string = 'Enter the name of an existing group';
export const placeholder: string = 'Enter the name an existing group';

export default class RemoveGroupForm extends React.PureComponent<
    ChangeGroupFormProps,
    RemoveGroupFormState
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupFormProps, context: ConfigProviderContext) {
        super(props);

        const fromRouter: boolean = !this.props.action;

        // Does this node have an existing action? If so, is it a 'remove_from_group' action?
        const hasRemoveAction: boolean = this.hasRemoveAction();

        const removeFromAll: boolean = hasRemoveAction && !this.props.action.groups.length;

        this.state = {
            fromRouter,
            hasRemoveAction,
            removeFromAll
        };

        this.onCheck = this.onCheck.bind(this);
        this.onValid = this.onValid.bind(this);
    }

    private onCheck(): void {
        this.setState({ removeFromAll: !this.state.removeFromAll });
    }

    public onValid(widgets: Widgets): void {
        const uuid: string = this.state.fromRouter ? generateUUID() : this.props.action.uuid;

        const newAction: ChangeGroup = {
            uuid,
            type: this.props.config.type,
            groups: []
        };

        if (this.state.removeFromAll) {
            const removeEle = widgets['Remove from All'] as CheckboxElement;
        } else {
            const groupEle = widgets.Group as GroupElement;
            const { state: { groups } } = groupEle;

            if (groups.length) {
                newAction.groups = groups.map((group: SearchResult) => ({
                    uuid: group.id,
                    name: group.name
                }));
            }
        }

        this.props.updateAction(newAction);
    }

    private hasRemoveAction(): boolean {
        if (!this.props.action) {
            return false;
        } else {
            if (this.props.action.type === 'remove_from_group') {
                return true;
            }
            return false;
        }
    }

    private getGroups(): GroupList {
        if (this.state.hasRemoveAction) {
            if (this.state.removeFromAll || this.props.action.groups == null) {
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

    private getFields(): JSX.Element {
        let groupElLabel: JSX.Element = null;
        let groupEl: JSX.Element = null;
        let checkboxEl: JSX.Element = null;

        const sibling: boolean = !this.state.removeFromAll;
        const localGroups: SearchResult[] = this.props.ComponentMap.getGroups();
        const groups: GroupList = this.getGroups();

        if (sibling) {
            groupElLabel = <p>{label}</p>;

            groupEl = (
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    placeholder={placeholder}
                    searchPromptText={notFound}
                    endpoint={this.context.endpoints.groups}
                    localGroups={localGroups}
                    groups={groups}
                    add={false}
                    required={true}
                />
            );
        } else {
            this.props.removeWidget('Group');
        }

        checkboxEl = (
            <CheckboxElement
                ref={this.props.onBindWidget}
                name="Remove from All"
                defaultValue={this.state.removeFromAll}
                description="Remove the active contact from all groups they're a member of."
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
