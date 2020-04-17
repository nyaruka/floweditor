import { react as bindCallbacks } from 'auto-bind';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import * as React from 'react';
import { renderIf } from 'utils';

import styles from './TimeoutControl.module.scss';
import i18n from 'config/i18n';
import TembaSelect, { TembaSelectStyle } from 'temba/TembaSelect';

export const TIMEOUT_OPTIONS = [
  { value: '60', label: i18n.t('forms.timeout_1 minute', '1 minute') },
  { value: '120', label: i18n.t('forms.timeout_2 minutes', '2 minutes') },
  { value: '180', label: i18n.t('forms.timeout_3 minutes', '3 minutes') },
  { value: '240', label: i18n.t('forms.timeout_4 minutes', '4 minutes') },
  { value: '300', label: i18n.t('forms.timeout_5 minutes', '5 minutes') },
  { value: '600', label: i18n.t('forms.timeout_10 minutes', '10 minutes') },
  { value: '900', label: i18n.t('forms.timeout_15 minutes', '15 minutes') },
  { value: '3600', label: i18n.t('forms.timeout_1 hour', '1 hour') },
  { value: '7200', label: i18n.t('forms.timeout_2 hours', '2 hours') },
  { value: '10800', label: i18n.t('forms.timeout_3 hours', '3 hours') },
  { value: '21600', label: i18n.t('forms.timeout_6 hours', '6 hours') },
  { value: '43200', label: i18n.t('forms.timeout_12 hours', '12 hours') },
  { value: '64800', label: i18n.t('forms.timeout_18 hours', '18 hours') },
  { value: '86400', label: i18n.t('forms.timeout_1 day', '1 day') },
  { value: '172800', label: i18n.t('forms.timeout_2 days', '2 days') },
  { value: '259200', label: i18n.t('forms.timeout_3 days', '3 days') },
  { value: '604800', label: i18n.t('forms.timeout_1 week', '1 week') }
];

export const DEFAULT_TIMEOUT = TIMEOUT_OPTIONS[4];

export const ellipsize = (str: string) => `${str}...`;

export interface TimeoutControlProps {
  timeout: number;
  onChanged(timeout: number): void;
}

export default class TimeoutControl extends React.Component<TimeoutControlProps> {
  constructor(props: TimeoutControlProps) {
    super(props);
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private getSelected(timeout: number): any {
    for (const [idx, { value }] of TIMEOUT_OPTIONS.entries()) {
      if (value === '' + timeout) {
        return TIMEOUT_OPTIONS[idx];
      }
    }
    return null;
  }

  private isChecked(): boolean {
    return this.props.timeout > 0;
  }

  private getInstructions(): string {
    const base = 'Continue when there is no response';
    return this.isChecked() ? `${base} for` : ellipsize(base);
  }

  private handleChecked(): void {
    if (this.props.timeout > 0) {
      this.props.onChanged(0);
    } else {
      this.props.onChanged(parseInt(DEFAULT_TIMEOUT.value));
    }
  }

  private handleTimeoutChanged(selected: any): void {
    this.props.onChanged(parseInt(selected.value));
  }

  public render(): JSX.Element {
    return (
      <div className={styles.timeout_control_container}>
        <div className={styles.left_section}>
          <CheckboxElement
            name={i18n.t('forms.timeout', 'Timeout')}
            checked={this.isChecked()}
            description={this.getInstructions()}
            checkboxClassName={styles.checkbox}
            onChange={this.handleChecked}
          />
        </div>
        {renderIf(this.isChecked())(
          <div className={styles.drop_down}>
            <TembaSelect
              name={i18n.t('forms.timeout', 'Timeout')}
              style={TembaSelectStyle.small}
              value={this.getSelected(this.props.timeout)}
              options={TIMEOUT_OPTIONS}
              onChange={this.handleTimeoutChanged}
            ></TembaSelect>
          </div>
        )}
      </div>
    );
  }
}
