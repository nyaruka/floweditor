import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { sortFieldsAndProperties } from 'components/flow/actions/updatecontact/helpers';
import { RouterFormProps } from 'components/flow/props';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { createResultNameInput } from 'components/flow/routers/widgets';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { AssetEntry, FormState, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, StartIsNonNumeric, validate } from 'store/validators';
import { small } from 'utils/reactselect';

import styles from './FieldRouterForm.module.scss';
import { getRoutableFields, nodeToState, stateToNode } from './helpers';
import i18n from 'config/i18n';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
  args = 'args',
  min = 'min',
  max = 'max',
  exit = 'exit'
}

export interface FieldRouterFormState extends FormState {
  field: AssetEntry;
  cases: CaseProps[];
  resultName: StringEntry;
}

export const leadInSpecId = 'lead-in';

export default class FieldRouterForm extends React.Component<
  RouterFormProps,
  FieldRouterFormState
> {
  public static contextTypes = {
    assetService: fakePropType,
    config: fakePropType
  };

  constructor(props: RouterFormProps) {
    super(props);
    this.state = nodeToState(this.props.nodeSettings, this.props.assetStore);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleUpdateResultName(value: string): void {
    const resultName = validate('Result Name', value, [Alphanumeric, StartIsNonNumeric]);
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName)
    });
  }

  private handleFieldChanged(selected: Asset[]): void {
    this.setState({ field: { value: selected[0] } });
  }

  private handleCasesUpdated(cases: CaseProps[]): void {
    this.setState({ cases });
  }

  private handleSave(): void {
    if (this.state.valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
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

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <div className={styles.lead_in}>
          If the contact's
          <div className={`${styles.field_select} select-small`}>
            <AssetSelector
              name="Contact Field"
              styles={small as any}
              assets={this.props.assetStore.fields}
              additionalOptions={getRoutableFields(this.context.config.flowType)}
              entry={this.state.field}
              searchable={true}
              sortFunction={sortFieldsAndProperties}
              onChange={this.handleFieldChanged}
            />
          </div>
        </div>
        <CaseList
          data-spec="cases"
          cases={this.state.cases}
          onCasesUpdated={this.handleCasesUpdated}
        />
        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
