import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ConfigProviderContext } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { ChangeGroups } from '../../../flowTypes';
import AssetService, { Asset } from '../../../services/AssetService';
import { updateChangeGroupsForm } from '../../../store/forms';
import AppState from '../../../store/state';
import { DispatchWithState } from '../../../store/thunks';
import { validate, validateRequired } from '../../../store/validators';
import GroupsElement from '../../form/GroupsElement';
import ChangeGroupsFormProps from './props';

export const LABEL = ' Select the group(s) to add the contact to.';
export const PLACEHOLDER = 'Enter the name of an existing group or create a new one';

export const labelSpecId = 'label';

export class AddGroupsForm extends React.Component<ChangeGroupsFormProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ChangeGroupsFormProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public onValid(): void {
        // we need a cast here since we are sharing our form helper with remove groups
        const updated = this.props.formHelper.stateToAction(
            this.props.action.uuid,
            this.props.form
        ) as ChangeGroups;
        this.props.updateAction(updated);
    }

    public validate(): boolean {
        return this.handleUpdateGroups(this.props.form.groups.value);
    }

    public handleUpdateGroups(assets: Asset[]): boolean {
        return (this.props.updateChangeGroupsForm({
            groups: validate('Groups', assets, [validateRequired])
        }) as any).valid;
    }

    public render(): JSX.Element {
        return (
            <>
                <p data-spec={labelSpecId}>{LABEL}</p>
                <GroupsElement
                    name="Groups"
                    placeholder={PLACEHOLDER}
                    assets={this.context.assetService.getGroupAssets()}
                    onChange={this.handleUpdateGroups}
                    entry={this.props.form.groups}
                    add={true}
                />
            </>
        );
    }
}

const mapStateToProps = ({ nodeEditor: { form } }: AppState) => ({
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateChangeGroupsForm }, dispatch);

const ConnectedAddGroupsFrom = connect(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(AddGroupsForm);

export default ConnectedAddGroupsFrom;
