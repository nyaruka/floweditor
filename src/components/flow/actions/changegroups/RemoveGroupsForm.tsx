import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import ChangeGroupsFormProps from '~/components/flow/actions/changegroups/props';
import * as styles from '~/components/flow/actions/changegroups/RemoveGroupsForm.scss';
import { renderChooserDialog } from '~/components/flow/actions/helpers';
import CheckboxElement from '~/components/form/checkbox/CheckboxElement';
import GroupsElement from '~/components/form/select/groups/GroupsElement';
import { ButtonSet } from '~/components/modal/Modal';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { ChangeGroups } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { ChangeGroupsFormState, mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';
import { renderIf } from '~/utils';

export const LABEL = 'Select the group(s) to remove the contact from.';
export const NOT_FOUND = 'Enter the name of an existing group';
export const PLACEHOLDER = 'Enter the name an existing group';
export const REMOVE_FROM_ALL = 'Remove from All';
export const REMOVE_FROM_ALL_DESC =
    "Remove the active contact from all groups they're a member of.";

export const labelSpecId = 'label';
export const fieldContainerSpecId = 'field-container';

export default class RemoveGroupsForm extends React.Component<
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

    private handleUpdate(keys: { groups?: Asset[]; removeAll?: boolean }): boolean {
        const updates: Partial<ChangeGroupsFormState> = {};

        // we only require groups if removeAll isn't checked
        let groupValidators = this.state.removeAll ? [] : [validateRequired];

        if (keys.hasOwnProperty('removeAll')) {
            updates.removeAll = keys.removeAll;
            if (keys.removeAll) {
                groupValidators = [];
            }
        }

        if (keys.hasOwnProperty('groups')) {
            updates.groups = validate('Groups', keys.groups, groupValidators);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleGroupsChange(groups: Asset[]): boolean {
        console.log('changed, ', groups);
        return this.handleUpdate({ groups });
    }

    public handleRemoveAllUpdate(removeAll: boolean): boolean {
        return this.handleUpdate({ removeAll });
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        return renderChooserDialog(
            this.props,
            this.getButtons(),
            <>
                {renderIf(!this.state.removeAll)(
                    <div>
                        <p data-spec={labelSpecId}>{LABEL}</p>
                        <GroupsElement
                            name="Groups"
                            placeholder={PLACEHOLDER}
                            assets={this.context.assetService.getGroupAssets()}
                            searchPromptText={NOT_FOUND}
                            onChange={this.handleGroupsChange}
                            entry={this.state.groups}
                            add={false}
                        />
                    </div>
                )}
                <CheckboxElement
                    name={REMOVE_FROM_ALL}
                    title={REMOVE_FROM_ALL}
                    labelClassName={this.state.removeAll ? '' : styles.checkbox}
                    checked={this.state.removeAll}
                    description={REMOVE_FROM_ALL_DESC}
                    onChange={this.handleRemoveAllUpdate}
                />
            </>
        );
    }
}
