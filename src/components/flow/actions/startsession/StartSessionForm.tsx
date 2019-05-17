import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { ActionFormProps } from 'components/flow/props';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { AssetArrayEntry, AssetEntry, FormState, mergeForm } from 'store/nodeEditor';
import { Required, validate } from 'store/validators';

import { initializeForm, stateToAction } from './helpers';

export interface StartSessionFormState extends FormState {
  recipients: AssetArrayEntry;
  flow: AssetEntry;
}

export default class StartSessionForm extends React.Component<
  ActionFormProps,
  StartSessionFormState
> {
  public static contextTypes = {
    endpoints: fakePropType,
    assetService: fakePropType
  };

  constructor(props: ActionFormProps) {
    super(props);

    this.state = initializeForm(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public handleRecipientsChanged(recipients: Asset[]): boolean {
    return this.handleUpdate({ recipients });
  }

  public handleFlowChanged(flows: Asset[]): boolean {
    let flow = null;
    if (flows && flows.length > 0) {
      flow = flows[0];
    }
    return this.handleUpdate({ flow });
  }

  private handleUpdate(keys: { flow?: Asset; recipients?: Asset[] }): boolean {
    const updates: Partial<StartSessionFormState> = {};

    if (keys.hasOwnProperty("recipients")) {
      updates.recipients = validate("Recipients", keys.recipients, [Required]);
    }

    if (keys.hasOwnProperty("flow")) {
      updates.flow = validate("Flow", keys.flow, [Required]);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    // validate in case they never updated an empty field
    const valid = this.handleUpdate({
      recipients: this.state.recipients.value,
      flow: this.state.flow.value
    });

    if (valid) {
      this.props.updateAction(
        stateToAction(this.props.nodeSettings, this.state)
      );

      // notify our modal we are done
      this.props.onClose(false);
    }
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: "Ok", onClick: this.handleSave },
      secondary: { name: "Cancel", onClick: () => this.props.onClose(true) }
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
        <div>
          <AssetSelector
            name="Recipients"
            assets={this.props.assetStore.recipients}
            completion={this.props.assetStore}
            entry={this.state.recipients}
            searchable={true}
            multi={true}
            onChange={this.handleRecipientsChanged}
          />
          <p />
          <AssetSelector
            name="Flow"
            placeholder="Select the flow to start"
            assets={this.props.assetStore.flows}
            entry={this.state.flow}
            searchable={true}
            onChange={this.handleFlowChanged}
          />
        </div>
      </Dialog>
    );
  }
}
