import * as React from 'react';
import { ChangeGroup, Endpoints } from '../../../flowTypes';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import GroupElement, { GroupList } from '../../form/GroupElement';
import CheckboxElement from '../../form/CheckboxElement';
import { endpointsPT } from '../../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../../providers/ConfigProvider/configContext';
import { Widget, Widgets } from '../../NodeEditor/NodeEditor';

export interface ChangeGroupFormProps {
    action: ChangeGroup;
    getActionUUID(): string;
    config: Type;
    updateAction(action: ChangeGroup): void;
    onBindWidget(ref: Widget): void;
    removeWidget(name: string): void;
    ComponentMap: ComponentMap;
}

export interface ChangeGroupFormState {
    removeFromAll: boolean;
}

export const addType: string = 'add_to_group';
export const removeType: string = 'remove_from_group';
export const addLabel: string = ' Select the group(s) to add the contact to.';
export const removeLabel: string = 'Select the group(s) to remove the contact from.';
export const notFoundAdd: string = 'Invalid group name';
export const notFoundRemove: string = 'Enter the name of an existing group';
export const placeholder: string = 'Enter a group name...';

export default class ChangeGroupForm extends React.PureComponent<
    ChangeGroupFormProps,
    ChangeGroupFormState
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: ChangeGroupFormProps, context: ConfigProviderContext) {
        super(props);

        const removeFromAll: boolean =
            this.props.action.groups != null && !this.props.action.groups.length;

        this.state = {
            removeFromAll
        };

        this.onCheck = this.onCheck.bind(this);
        this.onValid = this.onValid.bind(this);
    }

    private onCheck(): void {
        this.setState({ removeFromAll: !this.state.removeFromAll });
    }

    public onValid(widgets: Widgets): void {
        const newAction: ChangeGroup = {
            uuid: this.props.getActionUUID(),
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

    private getField(): JSX.Element {
        let groupElement: JSX.Element = null;
        let checkboxElement: JSX.Element = null;

        const adding = this.props.config.type === addType;
        const sibling: boolean = !this.state.removeFromAll;
        const localGroups: SearchResult[] = this.props.ComponentMap.getGroups();
        const groups: GroupList = this.props.action.groups
            ? this.props.action.groups.map(
                  ({ uuid: group, name }) => ({
                      group,
                      name
                  }),
                  []
              )
            : [];

        if (adding || (!adding && sibling)) {
            const searchPromptText: string | JSX.Element = adding ? notFoundAdd : notFoundRemove;

            groupElement = (
                <GroupElement
                    ref={this.props.onBindWidget}
                    name="Group"
                    placeholder={placeholder}
                    searchPromptText={searchPromptText}
                    endpoint={this.context.endpoints.groups}
                    localGroups={localGroups}
                    groups={groups}
                    add={adding}
                    required={true}
                />
            );
        } else {
            this.props.removeWidget('Group');
        }

        if (!adding) {
            checkboxElement = (
                <CheckboxElement
                    ref={this.props.onBindWidget}
                    name="Remove from All"
                    defaultValue={this.state.removeFromAll}
                    description="Remove the active contact from all groups they're a member of."
                    sibling={sibling}
                    onCheck={this.onCheck}
                />
            );
        }

        return (
            <div>
                {groupElement}
                {checkboxElement}
            </div>
        );
    }

    public render(): JSX.Element {
        const label: string = this.props.config.type === 'add_to_group' ? addLabel : removeLabel;
        const field: JSX.Element = this.getField();
        return (
            <div>
                <p>{label}</p>
                {field}
            </div>
        );
    }
}
