import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog from '~/components/dialog/Dialog';
import ChangeGroupsFormProps from '~/components/flow/actions/changegroups/props';
import GroupsElement from '~/components/form/select/groups/GroupsElement';
import { ButtonSet } from '~/components/modal/Modal';
import TypeList from '~/components/nodeeditor/TypeList';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { ChangeGroups } from '~/flowTypes';
import AssetService, { Asset } from '~/services/AssetService';
import { ChangeGroupsFormState, mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

export const LABEL = ' Select the group(s) to add the contact to.';
export const PLACEHOLDER = 'Enter the name of an existing group or create a new one';

export const labelSpecId = 'label';

export default class AddGroupsForm extends React.Component<
    ChangeGroupsFormProps,
    ChangeGroupsFormState
> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);
        this.state = this.props.formHelper.initializeForm(
            this.props.nodeSettings
        ) as ChangeGroupsFormState;

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleSave(): void {
        const valid = this.handleGroupsChange(this.state.groups.value);
        if (valid) {
            const newAction = this.props.formHelper.stateToAction(
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
        return (
            <Dialog
                title={this.props.typeConfig.name}
                headerClass={this.props.typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={this.props.typeConfig}
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
