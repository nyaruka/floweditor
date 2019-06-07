import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { ChangeGroups } from 'flowTypes';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { mergeForm } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import { ChangeGroupsFormState, excludeDynamicGroups, labelSpecId } from '../helpers';
import { initializeForm, stateToAction } from './helpers';

export default class AddGroupsForm extends React.Component<ActionFormProps, ChangeGroupsFormState> {
  constructor(props: ActionFormProps) {
    super(props);
    this.state = initializeForm(this.props.nodeSettings) as ChangeGroupsFormState;

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleSave(): void {
    const valid = this.handleGroupsChanged(this.state.groups.value!, true);
    if (valid) {
      const newAction = stateToAction(this.props.nodeSettings, this.state);
      this.props.updateAction(newAction as ChangeGroups);
      this.props.onClose(false);
    }
  }

  public handleGroupsChanged(groups: Asset[], submitting: boolean = false): boolean {
    const updates: Partial<ChangeGroupsFormState> = {
      groups: validate('Groups', groups, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  public handleGroupAdded(group: Asset): void {
    // update our store with our new group
    this.props.addAsset('groups', group);

    // try to add the group
    this.handleGroupsChanged((this.state.groups.value || []).concat(group), false);
  }

  public handleCreateAssetFromInput(input: string): any {
    return { name: input };
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
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p data-spec={labelSpecId}>Select the group(s) to add the contact to.</p>

        <AssetSelector
          name="Groups"
          multi={true}
          noOptionsMessage="Enter a name to create a new group"
          assets={this.props.assetStore.groups}
          entry={this.state.groups}
          onChange={this.handleGroupsChanged}
          searchable={true}
          shouldExclude={excludeDynamicGroups}
          // Groups can be created on the fly
          createPrefix="Create Group: "
          createAssetFromInput={this.handleCreateAssetFromInput}
          onAssetCreated={this.handleGroupAdded}
        />
      </Dialog>
    );
  }
}
