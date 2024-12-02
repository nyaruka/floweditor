import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { Asset, AssetType, updateAssets } from 'store/flowContext';
import * as mutators from 'store/mutators';
import { mergeForm } from 'store/nodeEditor';
import { DispatchWithState, GetState } from 'store/thunks';

import styles from './UpdateGroupForm.module.scss';
import i18n from 'config/i18n';
import { renderIssues } from '../helpers';
import { SelectOption } from 'components/form/select/SelectElement';
import { getName, initializeForm, stateToAction, UpdateGroupFormState } from './helpers';

export default class UpdateGroupForm extends React.Component<
  ActionFormProps,
  UpdateGroupFormState
> {
  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);

    this.state = initializeForm(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^get/, /^on/, /^handle/]
    });
  }

  private handleUpdate(
    keys: {
      type?: Types;
      name?: string;
      channel?: Asset;
      language?: Asset;
      status?: SelectOption;
      field?: Asset;
      settings?: SelectOption;
      fieldValue?: string;
    },
    submitting = false
  ): boolean {
    const updates: Partial<UpdateGroupFormState> = {};

    if (keys.hasOwnProperty('type')) {
      updates.type = keys.type;
    }

    if (keys.hasOwnProperty('field')) {
      updates.field = { value: keys.field };
    }

    if (keys.hasOwnProperty('fieldValue')) {
      updates.fieldValue = { value: keys.fieldValue, validationFailures: [] };
    }
    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handlePropertyChange(selected: any[]): boolean {
    const selection = selected[0];
    if (selection) {
      return this.handleUpdate({
        type: Types.set_wa_group_field,
        field: selection
      });
    }
  }

  private handleFieldUpdate(fieldValue: string): boolean {
    return this.handleUpdate({ fieldValue });
  }

  private onUpdated(dispatch: DispatchWithState, getState: GetState): void {
    const {
      flowContext: { assetStore }
    } = getState();

    if (this.state.field.value.type === AssetType.Field) {
      dispatch(updateAssets(mutators.addAssets('fields', assetStore, [this.state.field.value])));
    }
  }

  public handleFieldAdded(field: Asset): void {
    // update our store with our new group
    this.props.addAsset('fields', field);
    this.handlePropertyChange([field]);
  }

  private handleSave(): void {
    let valid = this.state.valid;

    if (valid) {
      // do the saving!
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state), this.onUpdated);
      this.props.onClose(true);
    }
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: i18n.t('buttons.ok', 'Ok'), onClick: this.handleSave },
      secondary: {
        name: i18n.t('buttons.cancel', 'Cancel'),
        onClick: () => this.props.onClose(true)
      }
    };
  }

  /**
   * The value widget varies for the action type
   */
  private getValueWidget(): JSX.Element {
    return (
      <TextInputElement
        name={i18n.t('forms.field_value', 'Field Value')}
        placeholder={i18n.t('forms.enter_field_value')}
        onChange={this.handleFieldUpdate}
        entry={this.state.fieldValue}
        autocomplete={true}
        focus={true}
      />
    );
  }

  public handleCreateAssetFromInput(input: string): any {
    return { label: input, value_type: 'text' };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    console.log();
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>{i18n.t('forms.select_what_to_update', 'Select what to update')}</p>
        <AssetSelector
          name={i18n.t('forms.wa_group_field', 'Group Field')}
          placeholder={i18n.t('Select')}
          assets={this.props.assetStore.waGroupFields}
          entry={this.state.field}
          searchable={true}
          onChange={this.handlePropertyChange}
          getName={getName}
          // Fields can be created on the fly
          createPrefix="Create Group Field: "
          createAssetFromInput={this.handleCreateAssetFromInput}
          onAssetCreated={this.handleFieldAdded}
        />

        <div className={styles.value}>{this.getValueWidget()}</div>
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
