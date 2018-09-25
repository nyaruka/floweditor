import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { ActionFormProps } from '~/components/flow/props';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { ChangeGroups } from '~/flowTypes';
import { Asset, AssetType, updateAssets } from '~/store/flowContext';
import * as mutators from '~/store/mutators';
import { mergeForm } from '~/store/nodeEditor';
import { DispatchWithState, GetState } from '~/store/thunks';
import { validate, validateRequired } from '~/store/validators';
import { createUUID } from '~/utils';

import { ChangeGroupsFormState, labelSpecId } from '../helpers';
import { initializeForm, stateToAction } from './helpers';

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

    private onUpdated(dispatch: DispatchWithState, getState: GetState): void {
        const {
            flowContext: { assetStore }
        } = getState();

        dispatch(updateAssets(mutators.addAssets('groups', assetStore, this.state.groups.value)));
    }

    public handleSave(): void {
        const valid = this.handleGroupsChanged(this.state.groups.value);
        if (valid) {
            const newAction = stateToAction(this.props.nodeSettings, this.state);
            this.props.updateAction(newAction as ChangeGroups, this.onUpdated);
            this.props.onClose(false);
        }
    }

    public handleGroupsChanged(groups: Asset[]): boolean {
        const updates: Partial<ChangeGroupsFormState> = {
            groups: validate('Groups', groups, [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleGroupAdded(name: string): void {
        const newGroup = { id: createUUID(), name, type: AssetType.Group };
        this.handleGroupsChanged(this.state.groups.value.concat(newGroup));
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        const typeConfig = this.props.typeConfig;
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
                <p data-spec={labelSpecId}>Select the group(s) to add the contact to.</p>

                <AssetSelector
                    name="Groups"
                    createPrefix="Create Group: "
                    assets={this.props.assets.groups}
                    entry={this.state.groups}
                    searchable={true}
                    onChange={this.handleGroupsChanged}
                    onCreateOption={this.handleGroupAdded}
                    noOptionsMessage="Enter a name to create a new group"
                    multi={true}
                />
            </Dialog>
        );
    }
}
