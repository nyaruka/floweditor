import { react as bindCallbacks } from 'auto-bind';
import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { hasErrors } from 'components/flow/actions/helpers';
import { RouterFormProps } from 'components/flow/props';
import TypeList from 'components/nodeeditor/TypeList';
import * as React from 'react';
import { FormState, StringEntry } from 'store/nodeEditor';
import { Numeric, Required, validate } from 'store/validators';

import { nodeToState, stateToNode } from './helpers';
import styles from './WebhookResultRouterForm.module.scss';
import i18n from 'config/i18n';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';

export interface WebhookResultRouterFormState extends FormState {
  days: StringEntry;
  hours: StringEntry;
  minutes: StringEntry;
}

export default class WebhookResultRouterForm extends React.Component<
  RouterFormProps,
  WebhookResultRouterFormState
> {
  constructor(props: RouterFormProps) {
    super(props);

    this.state = nodeToState(this.props.nodeSettings);

    bindCallbacks(this, {
      include: [/^on/, /^handle/]
    });
  }

  private handleDaysChange(value: string): void {
    const days = validate(i18n.t('forms.save_days', 'Days'), value, [Numeric, Required]);
    this.setState({
      days
    });
  }
  private handleMinutesChange(value: string): void {
    const minutes = validate(i18n.t('forms.save_minutes', 'Minutes'), value, [Numeric, Required]);
    this.setState({
      minutes
    });
  }

  private handleHoursChange(value: string): void {
    const hours = validate(i18n.t('forms.save_hours', 'Hours'), value, [Numeric, Required]);
    this.setState({
      hours
    });
  }

  private handleSave(): void {
    let valid = false;
    const minutes = validate(i18n.t('forms.save_minutes', 'Minutes'), this.state.minutes.value, [
      Numeric
    ]);
    const hours = validate(i18n.t('forms.save_hours', 'Hours'), this.state.hours.value, [Numeric]);
    const days = validate(i18n.t('forms.save_days', 'Days'), this.state.days.value, [Numeric]);

    if (!hasErrors(minutes) && !hasErrors(hours) && !hasErrors(days)) {
      valid = true;
    }

    const delayInSeconds =
      parseInt(days.value) * 86400 + parseInt(hours.value) * 3600 + parseInt(minutes.value) * 60;
    if (delayInSeconds === 0) {
      valid = false;
      this.setState({
        valid: false
      });
    }

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

        <div className={styles.result_container}>
          <div className={styles.input}>
            <span className={styles.title}>Days</span>
            <TextInputElement
              name={i18n.t('forms.save_days', 'Days')}
              placeholder="Enter days"
              onChange={this.handleDaysChange}
              style={TextInputStyle.small}
              entry={this.state.days}
            />
          </div>
          <div className={styles.input}>
            <span className={styles.title}>Hours</span>
            <TextInputElement
              name={i18n.t('forms.save_hours', 'Hours')}
              placeholder="Enter hours"
              onChange={this.handleHoursChange}
              style={TextInputStyle.small}
              entry={this.state.hours}
            />
          </div>
          <div className={styles.input}>
            <span className={styles.title}>Minutes</span>
            <TextInputElement
              name={i18n.t('forms.save_minutes', 'Minutes')}
              placeholder="Enter minutes"
              onChange={this.handleMinutesChange}
              style={TextInputStyle.small}
              entry={this.state.minutes}
            />
          </div>
        </div>
      </Dialog>
    );
  }

  public render(): JSX.Element {
    return this.renderEdit();
  }
}
