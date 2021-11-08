import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { createResultNameInput } from 'components/flow/routers/widgets';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { Asset } from 'store/flowContext';
import { FormEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, shouldRequireIf, StartIsNonNumeric, validate } from 'store/validators';

import {
  DELIMITER_OPTIONS,
  FIELD_NUMBER_OPTIONS,
  getDelimiterOption,
  getFieldOption,
  nodeToState,
  stateToNode
} from './helpers';
import styles from './ResultRouterForm.module.scss';
import i18n from 'config/i18n';
import { TembaSelectStyle } from 'temba/TembaSelect';

export interface ResultRouterFormState extends FormState {
  result: FormEntry;
  cases: CaseProps[];
  resultName: StringEntry;
  shouldDelimit: boolean;

  fieldNumber: number;
  delimiter: string;
}

export const leadInSpecId = 'lead-in';

export default class ResultRouterForm extends React.Component<
  RouterFormProps,
  ResultRouterFormState
> {
  options: SelectOption[] = [];

  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings, this.props.assetStore);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  public componentDidMount(): void {
    const items = this.props.assetStore.results.items;
    this.options = Object.keys(items).map((key: string) => {
      return { name: items[key].name, value: key };
    });
  }

  private handleUpdate(keys: { resultName?: string; cases?: CaseProps[] }): boolean {
    const updates: Partial<ResultRouterFormState> = {};

    if (keys.hasOwnProperty('cases')) {
      updates.cases = keys.cases;
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(i18n.t('forms.result_name', 'Result Name'), keys.resultName, [
        Alphanumeric,
        StartIsNonNumeric
      ]);
    }

    const updated = mergeForm(this.state, updates);

    // update our form
    this.setState(updated);
    return updated.valid;
  }

  private handleUpdateResultName(resultName: string): void {
    this.handleUpdate({ resultName });
  }

  private handleCasesUpdated(cases: CaseProps[]): void {
    this.handleUpdate({ cases });
  }

  private handleResultChanged(selected: Asset[], submitting = false): boolean {
    const updates: Partial<ResultRouterFormState> = {
      result: validate(i18n.t('forms.result_to_split_on', 'Result to split on'), selected[0], [
        shouldRequireIf(submitting)
      ])
    };

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    // if we still have invalid cases, don't move forward
    const invalidCase = this.state.cases.find((caseProps: CaseProps) => !caseProps.valid);
    if (invalidCase) {
      return;
    }

    const valid = this.handleResultChanged([this.state.result.value], true);
    if (valid) {
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

  private handleShouldDelimitChanged(checked: boolean): void {
    this.setState({ shouldDelimit: checked });
  }

  private handleFieldNumberChanged(selected: SelectOption): void {
    this.setState({ fieldNumber: parseInt(selected.value, 10) });
  }

  private handleDelimiterChanged(selected: SelectOption): void {
    this.setState({ delimiter: selected.value });
  }

  private renderField(): JSX.Element {
    return (
      <div className={styles.non_delimited}>
        <div className={styles.lead_in}>If the flow result</div>
        <div className={styles.result_select}>
          <AssetSelector
            entry={this.state.result}
            style={TembaSelectStyle.small}
            name={i18n.t('forms.flow_result', 'Flow Result')}
            placeholder="Select Result"
            searchable={false}
            assets={this.props.assetStore.results}
            onChange={this.handleResultChanged}
            additionalOptions={this.options}
          />
        </div>
      </div>
    );
  }

  private renderFieldDelimited(): JSX.Element {
    return (
      <div className={styles.delimited}>
        <div className={styles.lead_in}>If the</div>
        <div className={styles.field_number}>
          <SelectElement
            key="field_number_select"
            style={TembaSelectStyle.small}
            name={i18n.t('forms.field_number', 'Field Number')}
            entry={{ value: getFieldOption(this.state.fieldNumber) }}
            onChange={this.handleFieldNumberChanged}
            options={FIELD_NUMBER_OPTIONS}
          />
        </div>
        <div className={styles.lead_in_sub}>field of</div>
        <div className={styles.result_select_delimited}>
          <AssetSelector
            entry={this.state.result}
            style={TembaSelectStyle.small}
            name={i18n.t('forms.flow_result', 'Flow Result')}
            placeholder={i18n.t('forms.select_result', 'Select Result')}
            searchable={false}
            assets={this.props.assetStore.results}
            onChange={this.handleResultChanged}
            additionalOptions={this.options}
          />
        </div>
        <div className={styles.lead_in_sub}>delimited by</div>
        <div className={styles.delimiter}>
          <SelectElement
            key="delimiter_select"
            style={TembaSelectStyle.small}
            name={i18n.t('forms.delimiter', 'Delimiter')}
            entry={{ value: getDelimiterOption(this.state.delimiter) }}
            onChange={this.handleDelimiterChanged}
            options={DELIMITER_OPTIONS}
          />
        </div>
      </div>
    );
  }

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;
    const advanced: Tab = {
      name: 'Advanced',
      body: (
        <div className={styles.should_delimit}>
          <CheckboxElement
            name={i18n.t('forms.delimit', 'Delimit')}
            title={i18n.t('forms.delimit_result', 'Delimit Result')}
            checked={this.state.shouldDelimit}
            description={i18n.t(
              'forms.delimit_result_description',
              'Evaluate your rules against a delimited part of your result'
            )}
            onChange={this.handleShouldDelimitChanged}
          />
        </div>
      ),
      checked: this.state.shouldDelimit
    };

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={[advanced]}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />

        {this.state.shouldDelimit ? this.renderFieldDelimited() : this.renderField()}

        <CaseList
          data-spec="cases"
          cases={this.state.cases}
          onCasesUpdated={this.handleCasesUpdated}
        />
        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
