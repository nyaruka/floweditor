import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { AssetArrayEntry, FormState, mergeForm } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';

import { initializeForm, stateToAction } from './helpers';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';

export interface AddLabelsFormState extends FormState {
  labels: AssetArrayEntry;
}

export const controlLabelSpecId = 'label';

export default class AddLabelsForm extends React.PureComponent<
  ActionFormProps,
  AddLabelsFormState
> {
  public static contextTypes = {
    assetService: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);

    this.state = initializeForm(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleSave(): void {
    const valid = this.handleLabelsChanged(this.state.labels.value!, true);

    if (valid) {
      const newAction = stateToAction(this.props.nodeSettings, this.state);
      this.props.updateAction(newAction);
      this.props.onClose(false);
    }
  }

  public handleLabelsChanged(selected: Asset[], submitting: boolean = false): boolean {
    const updates: Partial<AddLabelsFormState> = {
      labels: validate('Labels', selected, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
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

  public handleCreateAssetFromInput(input: string): any {
    return { name: input };
  }

  public handleLabelCreated(label: Asset): void {
    // update our store with our new group
    this.props.addAsset('labels', label);

    this.handleLabelsChanged(this.state.labels.value!.concat(label));
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p data-spec={controlLabelSpecId}>
          <Trans i18nKey="forms.add_labels.summary">
            Select the labels to apply to the incoming message.
          </Trans>
        </p>

        <AssetSelector
          name="Labels"
          placeholder={i18n.t(
            'enter_to_create_label',
            'Enter the name of an existing label or create a new one'
          )}
          assets={this.props.assetStore.labels}
          entry={this.state.labels}
          searchable={true}
          multi={true}
          onChange={this.handleLabelsChanged}
          createPrefix={i18n.t('create_label', 'Create Label') + ': '}
          createAssetFromInput={this.handleCreateAssetFromInput}
          onAssetCreated={this.handleLabelCreated}
        />
      </Dialog>
    );
  }
}
