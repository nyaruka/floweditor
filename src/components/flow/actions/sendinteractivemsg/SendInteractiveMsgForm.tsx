/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import {
  getMsgBody,
  initializeForm as stateToForm,
  stateToAction
} from 'components/flow/actions/sendinteractivemsg/helpers';
import { ActionFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { FormEntry, FormState, mergeForm } from 'store/nodeEditor';
import { shouldRequireIf, validate } from 'store/validators';
import styles from './SendInteractiveMsg.module.scss';

import i18n from 'config/i18n';

import AssetSelector from 'components/form/assetselector/AssetSelector';
import { Asset } from 'store/flowContext';
import { AddLabelsFormState } from '../addlabels/AddLabelsForm';

export interface SendInteractiveMsgFormState extends FormState {
  interactives: FormEntry;
  labels?: any;
}

export default class SendMsgForm extends React.Component<
  ActionFormProps,
  SendInteractiveMsgFormState
> {
  constructor(props: ActionFormProps) {
    super(props);
    this.state = stateToForm(this.props.nodeSettings, this.props.assetStore);
    bindCallbacks(this, {
      include: [/^handle/, /^on/]
    });
  }

  public static contextTypes = {
    config: fakePropType
  };

  private handleInteractivesChanged(selected: any[]): void {
    const interactiveMsg = selected ? selected[0] : null;

    this.setState({
      interactives: {
        value: interactiveMsg
      }
    });
  }

  private handleUpdate(
    keys: {
      text?: any;
    },
    submitting = false
  ): boolean {
    const updates: Partial<SendInteractiveMsgFormState> = {};

    if (keys.hasOwnProperty('text')) {
      updates.interactives = validate(i18n.t('forms.message', 'Message'), keys.text, [
        shouldRequireIf(submitting)
      ]);
    }
    const updated = mergeForm(this.state, updates) as SendInteractiveMsgFormState;

    this.setState(updated);
    return updated.valid;
  }

  public handleMessageInput(event: React.KeyboardEvent) {
    return this.handleUpdate({ text: (event.target as any).value }, false);
  }

  public handleMessageUpdate(message: string, name: string, submitting = false): boolean {
    return this.handleUpdate({ text: message }, submitting);
  }

  public handleLabelsChanged(selected: Asset[], submitting: boolean = false): boolean {
    const updates: Partial<AddLabelsFormState> = {
      labels: validate(i18n.t('forms.labels', 'Labels'), selected, [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  public handleCreateAssetFromInput(input: string): any {
    return { name: input };
  }

  public handleLabelCreated(label: Asset): void {
    // update our store with our new group
    this.props.addAsset('labels', label);

    this.handleLabelsChanged(this.state.labels.value!.concat(label));
  }

  private handleSave(): void {
    // don't continue if our message already has errors
    if (hasErrors(this.state.interactives)) {
      return;
    }
    // make sure we validate untouched text fields and contact fields
    let valid = this.handleMessageUpdate(this.state.interactives.value, null, true);

    if (valid) {
      this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));
      // notify our modal we are done
      this.props.onClose(false);
    } else {
      this.setState({ valid });
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

  private renderLabelOption(): JSX.Element {
    return (
      <div className={styles.label_container}>
        <p>Select the labels to apply to the interactive message.</p>

        <AssetSelector
          name={i18n.t('forms.labels', 'Labels')}
          placeholder={i18n.t(
            'enter_to_create_label',
            'Enter the name of an existing label or create a new one'
          )}
          assets={this.props.assetStore.labels}
          entry={this.state.labels}
          searchable={true}
          multi={true}
          expressions={true}
          onChange={this.handleLabelsChanged}
          createPrefix={i18n.t('create_label', 'Create Label') + ': '}
          createAssetFromInput={this.handleCreateAssetFromInput}
          onAssetCreated={this.handleLabelCreated}
        />
      </div>
    );
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const currentMessage = this.state.interactives.value;
    let body;
    if (currentMessage && currentMessage.interactive_content) {
      const message = currentMessage.interactive_content;
      body = getMsgBody(message);
    }
    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={[]}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <AssetSelector
          name={i18n.t('forms.interactive', 'interactive')}
          noOptionsMessage="No interactive messages found"
          placeholder={'Select interactive message'}
          assets={this.props.assetStore.interactives}
          entry={this.state.interactives}
          onChange={this.handleInteractivesChanged}
          searchable={true}
          formClearable={true}
        />
        <div className={styles.body}> {body}</div>
        {this.renderLabelOption()}
      </Dialog>
    );
  }
}
