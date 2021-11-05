import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { renderIssues } from 'components/flow/actions/helpers';
import { getName, sortFieldsAndProperties } from 'components/flow/actions/updatecontact/helpers';
import { RouterFormProps } from 'components/flow/props';
import CaseList, { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { createResultNameInput } from 'components/flow/routers/widgets';
import AssetSelector from 'components/form/assetselector/AssetSelector';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import * as React from 'react';
import { FormEntry, FormState, mergeForm, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, Required, StartIsNonNumeric, validate } from 'store/validators';

import styles from './FieldRouterForm.module.scss';
import { getRoutableFields, nodeToState, stateToNode } from './helpers';
import i18n from 'config/i18n';
import { TembaSelectStyle } from 'temba/TembaSelect';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
  args = 'args',
  min = 'min',
  max = 'max',
  exit = 'exit'
}

export interface FieldRouterFormState extends FormState {
  field: FormEntry;
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

  private handleUpdate(keys: {
    resultName?: string;
    field?: string;
    cases?: CaseProps[];
  }): boolean {
    const updates: Partial<FieldRouterFormState> = {};

    if (keys.hasOwnProperty('field')) {
      updates.field = validate(i18n.t('forms.field', 'Field'), keys.field, [Required]);
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

  private handleFieldChanged(selected: any[]): void {
    this.handleUpdate({ field: selected[0] });
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
              name={i18n.t('forms.contact_field', 'Contact Field')}
              style={TembaSelectStyle.small}
              assets={this.props.assetStore.fields}
              additionalOptions={getRoutableFields(this.context.config.flowType)}
              valueKey="id"
              getName={getName}
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
        {renderIssues(this.props)}
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
