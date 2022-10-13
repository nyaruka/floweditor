import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { nodeToState, stateToNode } from 'components/flow/routers/dial/helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { FormState, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, Required, StartIsNonNumeric, validate } from 'store/validators';
import i18n from 'config/i18n';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';

export interface DialRouterFormState extends FormState {
  phone: StringEntry;
  resultName: StringEntry;
}

export default class DialRouterForm extends React.Component<RouterFormProps, DialRouterFormState> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handlePhoneUpdated(value: string): void {
    const phone = validate(i18n.t('forms.phone_number', 'Phone Number'), value, [Required]);
    this.setState({
      phone: phone,
      valid: this.state.valid && !hasErrors(phone)
    });
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

    const advanced: Tab = {
      name: i18n.t('forms.advanced', 'Advanced'),
      body: (
        <CheckboxElement
          name={i18n.t('forms.all_destinations', 'All Destinations')}
          title={i18n.t('forms.all_destinations', 'All Destinations')}
          // todo labelClassName={styles.checkbox}
          checked={false} // todo checked={this.state.sendAll}
          description={i18n.t(
            'forms.all_destinations_description',
            "Send a message to all destinations known for this contact. If you aren't sure what this means, leave it unchecked."
          )}
          // todo onChange={this.handleSendAllUpdate}
        />
      )
      // todo checked: this.state.sendAll
    };

    const tabs = [advanced];

    return (
      <Dialog
        title={typeConfig.name}
        headerClass={typeConfig.type}
        buttons={this.getButtons()}
        tabs={tabs}
      >
        <TypeList __className="" initialType={typeConfig} onChange={this.props.onTypeChange} />
        <p>Enter the phone number to dial</p>
        <TextInputElement
          name="phone"
          placeholder={i18n.t('forms.phone_number', 'Phone Number')}
          showLabel={false}
          autocomplete={true}
          onChange={this.handlePhoneUpdated}
          entry={this.state.phone}
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
