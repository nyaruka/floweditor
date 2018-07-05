import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CheckboxElement from '~/component/form/CheckboxElement';
import GroupsElement from '~/component/form/GroupsElement';
import { updateChangeGroupsForm } from '~/store/forms';
import AppState from '~/store/state';
import { DispatchWithState } from '~/store/thunks';
import { validate, validateRequired } from '~/store/validators';

import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { ChangeGroups } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import ChangeGroupsFormProps from './props';
import * as styles from './RemoveGroupsForm.scss';

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
export class RemoveGroupsForm extends React.Component<ChangeGroupsFormProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);
        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public validate(): boolean {
        return this.handleUpdateGroups(this.props.form.groups.value);
    }

    private handleUpdateGroups(groups: Asset[]): boolean {
        const validators = [];
        if (!this.props.form.removeAll) {
            validators.push(validateRequired);
        }

        return (this.props.updateChangeGroupsForm({
            groups: validate('Groups', groups, validators)
        }) as any).valid;
    }

    public handleUpdateRemoveAll(checked: boolean): void {
        this.props.updateChangeGroupsForm({
            removeAll: checked,
            groups: { value: null }
        });
    }

    public onValid(): void {
        // we need a cast here since we are sharing our state with add groups
        const updated = this.props.formHelper.stateToAction(
            this.props.action.uuid,
            this.props.form
        ) as ChangeGroups;
        this.props.updateAction(updated);
    }

    private getFields(): JSX.Element {
        let groupElLabel: JSX.Element = null;
        let groupEl: JSX.Element = null;
        let checkboxEl: JSX.Element = null;
        const sibling = !this.props.form.removeAll;

        if (sibling) {
            groupElLabel = <p data-spec={labelSpecId}>{LABEL}</p>;

            groupEl = (
                <GroupsElement
                    name="Groups"
                    placeholder={PLACEHOLDER}
                    searchPromptText={NOT_FOUND}
                    assets={this.context.assetService.getGroupAssets()}
                    entry={this.props.form.groups}
                    add={false}
                    onChange={this.handleUpdateGroups}
                />
            );
        }

        checkboxEl = (
            <CheckboxElement
                name={REMOVE_FROM_ALL}
                title={REMOVE_FROM_ALL}
                labelClassName={this.props.form.removeAll ? '' : styles.checkbox}
                checked={this.props.form.removeAll}
                description={REMOVE_FROM_ALL_DESC}
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

/* istanbul ignore next */
const mapStateToProps = ({ nodeEditor: { form } }: AppState) => ({
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateChangeGroupsForm }, dispatch);

const ConnectedRemoveGroupsFrom = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        withRef: true
    }
)(RemoveGroupsForm);

export default ConnectedRemoveGroupsFrom;
