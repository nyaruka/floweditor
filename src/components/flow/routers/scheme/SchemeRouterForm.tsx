import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { RouterFormProps } from 'components/flow/props';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TypeList from 'components/nodeeditor/TypeList';
import { fakePropType } from 'config/ConfigProvider';
import { FormState, mergeForm, StringEntry, SelectOptionArrayEntry } from 'store/nodeEditor';
import { Alphanumeric, Required, StartIsNonNumeric, validate } from 'store/validators';
import i18n from 'config/i18n';
import { getChannelTypeOptions, nodeToState, stateToNode } from './helpers';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import { renderIssues } from 'components/flow/actions/helpers';

export interface SchemeRouterFormState extends FormState {
  schemes: SelectOptionArrayEntry;
  resultName: StringEntry;
}

export default class SchemeRouterForm extends React.Component<
  RouterFormProps,
  SchemeRouterFormState
> {
  public static contextTypes = {
    endpoints: fakePropType,
    assetService: fakePropType
  };

  constructor(props: RouterFormProps) {
    super(props);
    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleSchemesChanged(schemes: SelectOption[]): void {
    this.handleUpdate({ schemes });
  }

  private handleUpdateResultName(resultName: string): void {
    this.handleUpdate({ resultName });
  }

  private handleUpdate(keys: { schemes?: SelectOption[]; resultName?: string }): boolean {
    const updates: Partial<SchemeRouterFormState> = {};

    if (keys.hasOwnProperty('schemes')) {
      updates.schemes = validate(i18n.t('forms.split_by_scheme', 'Channel types'), keys.schemes, [
        Required
      ]);
    }

    if (keys.hasOwnProperty('resultName')) {
      updates.resultName = validate(i18n.t('forms.result_name', 'Result Name'), keys.resultName, [
        Alphanumeric,
        StartIsNonNumeric
      ]);
    }

    const updated = mergeForm(this.state, updates);
    this.setState(updated);
    return updated.valid;
  }

  private handleSave(): void {
    this.handleSchemesChanged(this.state.schemes.value);
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

  public render(): JSX.Element {
    const typeConfig = this.props.typeConfig;

    return (
      <Dialog title={typeConfig.name} headerClass={typeConfig.type} buttons={this.getButtons()}>
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>
          {i18n.t(
            'forms.split_by_scheme_summary',
            "The contact's URN is the address they used to reach you such as their phone number or a Facebook ID. Select which URN types to split by below."
          )}
        </p>
        <SelectElement
          key="channel_type_select"
          name={i18n.t('forms.channel_type', 'Channel Type')}
          placeholder={i18n.t(
            'forms.split_by_channel_placeholder',
            'Select the channels to split by'
          )}
          entry={this.state.schemes}
          onChange={this.handleSchemesChanged}
          options={getChannelTypeOptions()}
          multi={true}
          hideError={true}
        />
        {createResultNameInput(this.state.resultName, this.handleUpdateResultName)}
        {renderIssues(this.props)}
      </Dialog>
    );
  }
}
