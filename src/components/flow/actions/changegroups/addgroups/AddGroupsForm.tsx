import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import {
    initializeForm,
    stateToAction
} from '~/components/flow/actions/changegroups/addgroups/helpers';
import { ChangeGroupsFormState, labelSpecId } from '~/components/flow/actions/changegroups/helpers';
import { determineTypeConfig } from '~/components/flow/helpers';
import { ActionFormProps } from '~/components/flow/props';
import GroupsElement from '~/components/form/select/groups/GroupsElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { ChangeGroups } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

export const LABEL = ' Select the group(s) to add the contact to.';
export const PLACEHOLDER = 'Enter the name of an existing group or create a new one';

export default class AddGroupsForm extends React.Component<ActionFormProps, ChangeGroupsFormState> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ActionFormProps) {
        super(props);
        this.state = initializeForm(this.props.nodeSettings) as ChangeGroupsFormState;

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleSave(): void {
        const valid = this.handleGroupsChange(this.state.groups.value);
        if (valid) {
            const newAction = stateToAction(
                this.props.nodeSettings.originalAction.uuid,
                this.state
            );
            this.props.updateAction(newAction as ChangeGroups);
            this.props.onClose(false);
        }
    }

    public handleGroupsChange(groups: Asset[]): boolean {
        const updates: Partial<ChangeGroupsFormState> = {
            groups: validate('Groups', groups, [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        const typeConfig = determineTypeConfig(this.props.nodeSettings);
        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <p data-spec={labelSpecId}>{LABEL}</p>
                <GroupsElement
                    name="Groups"
                    placeholder={PLACEHOLDER}
                    assets={this.context.assetService.getGroupAssets()}
                    onChange={this.handleGroupsChange}
                    entry={this.state.groups}
                    add={true}
                />
            </Dialog>
        );
    }
}
