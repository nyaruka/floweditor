import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import { AssetEntry, FormState, mergeForm, StringEntry, ValidationFailure } from 'store/nodeEditor';
import { Alphanumeric, shouldRequireIf, StartIsNonNumeric, validate } from 'store/validators';
import { snakify } from 'utils';

import { initializeForm, stateToAction } from './helpers';
import styles from './SetRunResultForm.module.scss';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';

export interface SetRunResultFormState extends FormState {
  name: AssetEntry;
  value: StringEntry;
  category: StringEntry;
}

export default class SetRunResultForm extends React.PureComponent<
  ActionFormProps,
  SetRunResultFormState
> {
  constructor(props: ActionFormProps) {
    super(props);

    this.state = initializeForm(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });
  }

  private handleNameUpdate(selected: Asset[]): void {
    this.handleUpdate({ name: selected[0] });
  }

  public handleValueUpdate(value: string): boolean {
    return this.handleUpdate({ value });
  }

  public handleCategoryUpdate(category: string): boolean {
    return this.handleUpdate({ category });
  }

  private handleUpdate(
    keys: { name?: Asset; value?: string; category?: string },
    submitting: boolean = false
  ): boolean {
    const updates: Partial<SetRunResultFormState> = {};

    if (keys.hasOwnProperty('name')) {
      updates.name = validate('Name', keys.name, [
        shouldRequireIf(submitting),
        Alphanumeric,
        StartIsNonNumeric
      ]);
    }

    if (keys.hasOwnProperty('value')) {
      updates.value = validate('Value', keys.value, []);
    }

    if (keys.hasOwnProperty('category')) {
      updates.category = validate('Category', keys.category, []);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    // make sure we validate untouched text fields
    const valid = this.handleUpdate({ name: this.state.name.value }, true);

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

      // notify our modal we are done
      this.props.onClose(false);
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

  private handleCreateAssetFromInput(input: string): Asset {
    return {
      id: snakify(input),
      name: input,
      type: AssetType.Result
    };
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    const snaked =
      !hasErrors(this.state.name) && this.state.name.value
        ? '.' + snakify(this.state.name.value.name)
        : '';

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <div className={styles.form}>
          <AssetSelector
            name="Result"
            assets={this.props.assetStore.results}
            entry={this.state.name}
            searchable={true}
            createPrefix={i18n.t('forms.set_run_result.create_prefix', 'New: ')}
            onChange={this.handleNameUpdate}
            createAssetFromInput={this.handleCreateAssetFromInput}
            formClearable={true}
            showLabel={true}
            helpText={
              <Trans
                i18nKey="forms.result_name_help"
                values={{ resultFormat: `@results${snaked}` }}
              >
                By naming the result, you can reference it later using [[resultFormat]]
              </Trans>
            }
          />

          <TextInputElement
            __className={styles.value}
            name="Value"
            showLabel={true}
            onChange={this.handleValueUpdate}
            entry={this.state.value}
            onFieldFailures={(persistantFailures: ValidationFailure[]) => {
              const value = { ...this.state.value, persistantFailures };
              this.setState({
                value,
                valid: this.state.valid && !hasErrors(value)
              });
            }}
            autocomplete={true}
            helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
          />
          <TextInputElement
            __className={styles.category}
            name="Category"
            placeholder="Optional"
            showLabel={true}
            onChange={this.handleCategoryUpdate}
            entry={this.state.category}
            autocomplete={false}
            helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
          />
        </div>
      </Dialog>
    );
  }
}
