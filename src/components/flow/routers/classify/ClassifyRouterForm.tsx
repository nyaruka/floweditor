import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { nodeToState, stateToNode, createEmptyCase } from './helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormState, mergeForm, StringEntry, AssetEntry } from 'store/nodeEditor';
import {
  Alphanumeric,
  Required,
  shouldRequireIf,
  StartIsNonNumeric,
  validate
} from 'store/validators';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import { Asset } from 'store/flowContext';
import { renderIf } from 'utils';
import { intentOperatorList } from 'config/operatorConfigs';
import TextInputElement from 'components/form/textinput/TextInputElement';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { fetchAsset } from 'external';
import styles from './ClassifyRouterForm.module.scss';

export interface ClassifyRouterFormState extends FormState {
  hiddenCases: CaseProps[];
  resultName: StringEntry;
  classifier: AssetEntry;
  cases: CaseProps[];
  operand: StringEntry;
}

export default class ClassifyRouterForm extends React.Component<
  RouterFormProps,
  ClassifyRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);
    bindCallbacks(this, {
      include: [/^handle/]
    });

    // we need to resolve our classifier for intent selection
    if (this.state.classifier.value) {
      fetchAsset(this.props.assetStore.classifiers, this.state.classifier.value.id).then(
        (classifier: Asset) => {
          this.handleUpdate({ classifier });
        }
      );
    }
  }

  private handleUpdate(
    keys: {
      resultName?: string;
      classifier?: Asset;
    },
    submitting = false
  ): boolean {
    const updates: Partial<ClassifyRouterFormState> = {};

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate('Result Name', keys.resultName, [shouldRequireIf(submitting)]);
    }

    if (keys.hasOwnProperty('classifier')) {
      updates.classifier = validate('Classifier', keys.classifier, [shouldRequireIf(submitting)]);
    }

    const updated = mergeForm(this.state, updates);

    // update our form
    this.setState(updated);
    return updated.valid;
  }

  private handleCasesUpdated(cases: CaseProps[]): void {
    const invalidCase = cases.find((caseProps: CaseProps) => !caseProps.valid);
    this.setState({ cases, valid: !invalidCase });
  }

  private handleUpdateResultName(value: string): void {
    const resultName = validate('Result Name', value, [Required, Alphanumeric, StartIsNonNumeric]);
    this.setState({
      resultName,
      valid: this.state.valid && !hasErrors(resultName)
    });
  }

  private handleSave(): void {
    // if we still have invalid cases, don't move forward
    const invalidCase = this.state.cases.find((caseProps: CaseProps) => !caseProps.valid);
    if (invalidCase) {
      return;
    }

    // validate our result name in case they haven't interacted
    const valid = this.handleUpdate(
      {
        resultName: this.state.resultName.value,
        classifier: this.state.classifier.value
      },
      true
    );

    if (valid) {
      this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
      this.props.onClose(false);
    }
  }

  private handleClassifierUpdated(selected: Asset[]): void {
    this.handleUpdate({ classifier: selected[0] });
  }

  private handleOperandUpdated(value: string): void {
    this.setState({ operand: validate('Operand', value, [Required]) });
  }

  private getButtons(): ButtonSet {
    return {
      primary: { name: 'Ok', onClick: this.handleSave },
      secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
    };
  }

  private dialog: Dialog;

  private renderEdit(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    const tabs: Tab[] = [
      {
        name: 'Classifier Input',
        checked: this.state.operand.value !== DEFAULT_OPERAND,
        body: (
          <>
            <p>
              Enter an expression to use as the input to your classifier. To classify the last
              response from the contact use <code>{DEFAULT_OPERAND}</code>.
            </p>
            <TextInputElement
              name="Operand"
              showLabel={false}
              autocomplete={true}
              onChange={this.handleOperandUpdated}
              entry={this.state.operand}
            />
          </>
        )
      }
    ];

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
        ref={ele => {
          this.dialog = ele;
        }}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>
          <span>Run </span>
          <span
            className={styles.link}
            onClick={() => {
              this.dialog.showTab(0);
            }}
          >
            {this.state.operand.value === DEFAULT_OPERAND
              ? 'the last response'
              : this.state.operand.value}
          </span>
          <span> through the classifier...</span>
        </p>
        <AssetSelector
          key="select_classifier"
          name="Classifier"
          placeholder="Select the classifier to use"
          assets={this.props.assetStore.classifiers}
          onChange={this.handleClassifierUpdated}
          entry={this.state.classifier}
        />

        {renderIf(!!this.state.classifier.value)(
          <CaseList
            data-spec="cases"
            cases={this.state.cases}
            onCasesUpdated={this.handleCasesUpdated}
            operators={intentOperatorList}
            createEmptyCase={createEmptyCase}
            classifier={this.state.classifier.value}
          />
        )}

        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
