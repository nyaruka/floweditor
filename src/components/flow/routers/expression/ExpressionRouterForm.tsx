import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { nodeToState, stateToNode } from 'components/flow/routers/expression/helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, Required, StartIsNonNumeric, validate } from 'store/validators';
import i18n from 'config/i18n';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
  args = 'args',
  min = 'min',
  max = 'max',
  exit = 'exit'
}

export interface ExpressionRouterFormState extends FormState {
  cases: CaseProps[];
  resultName: StringEntry;
  operand: StringEntry;
}

export const leadInSpecId = 'lead-in';

export default class ExpressionRouterForm extends React.Component<
  RouterFormProps,
  ExpressionRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleUpdate(keys: {
    resultName?: string;
    operand?: string;
    cases?: CaseProps[];
  }): boolean {
    const updates: Partial<ExpressionRouterFormState> = {};

    if (keys.hasOwnProperty('operand')) {
      updates.operand = validate(i18n.t('forms.operand', 'Operand'), keys.operand, [Required]);
    }

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

  private handleOperandUpdated(operand: string): void {
    this.handleUpdate({ operand });
  }

  private handleCasesUpdated(cases: CaseProps[]): void {
    this.handleUpdate({ cases });
  }

  private handleSave(): void {
    // if we still have invalid cases, don't move forward
    const invalidCase = this.state.cases.find((caseProps: CaseProps) => !caseProps.valid);
    if (invalidCase) {
      return;
    }

    // validate our result name in case they haven't interacted
    const valid = this.handleUpdate({
      resultName: this.state.resultName.value,
      operand: this.state.operand.value
    });

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

  public renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>If the expression...</p>
        <TextInputElement
          name={i18n.t('forms.operand', 'Operand')}
          showLabel={false}
          autocomplete={true}
          onChange={this.handleOperandUpdated}
          entry={this.state.operand}
        />
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

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
