import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { createResultNameInput } from 'components/flow/routers/widgets';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { AssetEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import {
  Alphanumeric,
  Required,
  shouldRequireIf,
  StartIsNonNumeric,
  validate
} from 'store/validators';

import { nodeToState, stateToNode } from './helpers';
import styles from './ResthookRouterForm.module.scss';

// TODO: Remove use of Function
export interface ResthookRouterFormState extends FormState {
  resthook: AssetEntry;
  resultName: StringEntry;
}

export default class ResthookRouterForm extends React.PureComponent<
  RouterFormProps,
  ResthookRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleUpdateResultName(result: string): void {
    const resultName = validate('Result Name', result, [Required, Alphanumeric, StartIsNonNumeric]);
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName)
    });
  }

  public handleResthookChanged(selected: Asset[], submitting = false): boolean {
    const updates: Partial<ResthookRouterFormState> = {
      resthook: validate('Resthook', selected[0], [shouldRequireIf(submitting)])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    // validate our resthook in case they haven't interacted
    const valid = this.handleResthookChanged([this.state.resthook.value], true);

    if (valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
  }

  public getButtons(): ButtonSet {
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
        <AssetSelector
          name="Resthook"
          placeholder="Select the resthook to call"
          assets={this.props.assetStore.resthooks}
          entry={this.state.resthook}
          searchable={true}
          onChange={this.handleResthookChanged}
        />
        <div className={styles.result_name}>
          {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
        </div>
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
