import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormState, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, StartIsNonNumeric, validate } from 'store/validators';

import styles from './DigitsRouterForm.module.scss';
import { nodeToState, stateToNode } from './helpers';
import i18n from 'config/i18n';
import { Operator, Operators } from 'config/interfaces';
import { operatorConfigList } from 'config/operatorConfigs';

export interface DigitsRouterFormState extends FormState {
  cases: CaseProps[];
  resultName: StringEntry;
}

export default class DigitsRouterForm extends React.Component<
  RouterFormProps,
  DigitsRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private getOperators(): Operator[] {
    return operatorConfigList.filter(
      operator =>
        operator.type === Operators.has_beginning || operator.type.indexOf('has_number') === 0
    );
  }

  private handleUpdateResultName(value: string): void {
    const resultName = validate(i18n.t('forms.result_name', 'Result Name'), value, [
      Alphanumeric,
      StartIsNonNumeric
    ]);
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName)
    });
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
    const operators = this.getOperators();
    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p className={styles.lead_in}>If the keypad entry before the # symbol..</p>
        <CaseList
          data-spec="cases"
          cases={this.state.cases}
          onCasesUpdated={this.handleCasesUpdated}
          operators={operators}
        />
        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
