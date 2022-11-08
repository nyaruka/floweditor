import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet, Tab } from 'components/dialog/Dialog';
import { hasErrors, renderIssues } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import { nodeToState, stateToNode } from 'components/flow/routers/dial/helpers';
import { createResultNameInput } from 'components/flow/routers/widgets';
import TextInputElement from 'components/form/textinput/TextInputElement';
import TypeList from 'components/nodeeditor/TypeList';
import { FormState, NumberEntry, StringEntry } from 'store/nodeEditor';
import { Alphanumeric, Numeric, Required, StartIsNonNumeric, validate } from 'store/validators';
import i18n from 'config/i18n';
import styles from './DialRouterForm.module.scss';

export interface DialRouterFormState extends FormState {
  phone: StringEntry;
  resultName: StringEntry;
  dialLimit: NumberEntry;
  callLimit: NumberEntry;
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

  private handleDialLimitUpdated(value: string): void {
    const dialLimit = validate(
      i18n.t('forms.dial_limit_seconds', 'Dialing time limit (seconds)'),
      value,
      [Numeric]
    );
    this.setState({
      dialLimit: dialLimit,
      valid: this.state.valid && !hasErrors(dialLimit)
    });
  }

  private handleCallLimitUpdated(value: string): void {
    const callLimit = validate(
      i18n.t('forms.call_limit_seconds', 'Call time limit (seconds)'),
      value,
      [Numeric]
    );
    this.setState({
      callLimit: callLimit,
      valid: this.state.valid && !hasErrors(callLimit)
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
      name: i18n.t('advanced', 'Advanced'),
      body: (
        <>
          <div className="flex-container">
            <div>1</div>
            <div>2</div>
            {/* <div>
              <p>{i18n.t('forms.dial_limit_seconds', 'Dialing time limit (seconds)')}</p>
              <TextInputElement
                name="dial_limit_seconds"
                placeholder={'60'}
                maxLength={2} //max 99s = 1.65min
                onChange={this.handleDialLimitUpdated}
                entry={(this.state.dialLimit as any) as StringEntry}
              ></TextInputElement>
            </div>
            <div>
              <p>{i18n.t('forms.call_limit_seconds', 'Call time limit (seconds)')}</p>
              <TextInputElement
                name="call_limit_seconds"
                placeholder={'7200'}
                maxLength={4} //max 9999s = 166.65min = 2.7775hrs
                onChange={this.handleCallLimitUpdated}
                entry={(this.state.callLimit as any) as StringEntry}
              ></TextInputElement>
            </div> */}
          </div>
        </>
      )
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
