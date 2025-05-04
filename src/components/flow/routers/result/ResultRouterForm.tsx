import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { createResultNameInput } from 'components/flow/routers/widgets';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import { SelectOption } from 'components/form/select/SelectElement';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';

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
import TembaSelectElement from 'temba/TembaSelectElement';
import { store } from 'store';
import { InfoResult } from 'temba-components';
import { parse } from '@babel/core';

export interface ResultRouterFormState extends FormState {
  result: FormEntry;
  cases: CaseProps[];
  resultName: StringEntry;
  shouldDelimit: boolean;

  fieldNumber: number;
  delimiter: string;
}

export const leadInSpecId = 'lead-in';

export default class ResultRouterForm extends React.PureComponent<
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
    this.setState({ cases });
  }

  private handleResultChanged(selected: InfoResult, submitting = false): boolean {
    const updates: Partial<ResultRouterFormState> = {
      result: validate(i18n.t('forms.result_to_split_on', 'Result to split on'), selected, [
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

    const valid = this.handleResultChanged(this.state.result.value, true);
    // make sure we validate untouched text fields
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

  private handleShouldDelimitChanged(event: any): void {
    this.setState({ shouldDelimit: event.target.checked });
  }

  private handleFieldNumberChanged(selected: SelectOption): void {
    const updates: Partial<ResultRouterFormState> = {
      fieldNumber: parseInt(selected.value, 10)
    };
    const updated = mergeForm(this.state, updates);
    this.setState(updated);
  }

  private handleDelimiterChanged(selected: SelectOption): void {
    this.setState({ delimiter: selected.value });
  }

  private renderField(): JSX.Element {
    return (
      <div className={styles.non_delimited}>
        <div className={styles.lead_in}>If the flow result</div>
        <div className={styles.result_select}>
          <TembaSelectElement
            entry={this.state.result}
            style={TembaSelectStyle.small}
            name={i18n.t('forms.flow_result', 'Flow Result')}
            searchable={false}
            placeholder={i18n.t('forms.select_result', 'Select Result')}
            valueKey="key"
            nameKey="name"
            onChange={this.handleResultChanged}
            options={store.getState().getFlowResults()}
          ></TembaSelectElement>
        </div>
      </div>
    );
  }

  private renderFieldDelimited(): JSX.Element {
    return (
      <div className={styles.delimited}>
        <div className={styles.lead_in}>If the</div>
        <div className={styles.field_number}>
          <TembaSelectElement
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
          <TembaSelectElement
            entry={this.state.result}
            style={TembaSelectStyle.small}
            name={i18n.t('forms.flow_result', 'Flow Result')}
            placeholder={i18n.t('forms.select_result', 'Select Result')}
            searchable={false}
            valueKey="key"
            nameKey="name"
            onChange={this.handleResultChanged}
            options={store.getState().getFlowResults()}
          />
        </div>
        <div className={styles.lead_in_sub}>delimited by</div>
        <div className={styles.delimiter}>
          <TembaSelectElement
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
    const optional: any = {};
    if (this.state.shouldDelimit) {
      optional['checked'] = true;
    }

    const typeConfig = this.props.typeConfig;
    const advanced: Tab = {
      name: 'Advanced',
      body: (
        <div className={styles.should_delimit}>
          <temba-checkbox
            label={i18n.t('forms.delimit_result', 'Delimit Result')}
            help_text={i18n.t(
              'forms.delimit_result_description',
              'Evaluate your rules against a delimited part of your result'
            )}
            {...optional}
            onClick={this.handleShouldDelimitChanged}
          ></temba-checkbox>
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
