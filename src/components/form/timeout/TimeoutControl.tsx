import { react as bindCallbacks } from 'auto-bind';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import * as React from 'react';
import Select from 'react-select';
import { renderIf } from 'utils';
import { small } from 'utils/reactselect';
import i18n from 'config/i18n';

import styles from './TimeoutControl.module.scss';

export const TIMEOUT_OPTIONS = [
  { value: 60, label: i18n.t('select.time.1_minute', '1 minute') },
  { value: 120, label: i18n.t('select.time.2_minute', '2 minutes') },
  { value: 180, label: i18n.t('select.time.3_minute', '3 minutes') },
  { value: 240, label: i18n.t('select.time.4_minute', '4 minutes') },
  { value: 300, label: i18n.t('select.time.5_minute', '5 minutes') },
  { value: 600, label: i18n.t('select.time.10_minute', '10 minutes') },
  { value: 900, label: i18n.t('select.time.15_minute', '15 minutes') },
  { value: 3600, label: i18n.t('select.time.1_hours', '1 hours') },
  { value: 7200, label: i18n.t('select.time.2_hours', '2 hours') },
  { value: 10800, label: i18n.t('select.time.3_hours', '3 hours') },
  { value: 21600, label: i18n.t('select.time.6_hours', '6 hours') },
  { value: 43200, label: i18n.t('select.time.12_hours', '12 hours') },
  { value: 64800, label: i18n.t('select.time.18_hours', '18 hours') },
  { value: 86400, label: i18n.t('select.time.1_day', '1 day') },
  { value: 172800, label: i18n.t('select.time.2_day', '2 days') },
  { value: 259200, label: i18n.t('select.time.3_day', '3 days') },
  { value: 604800, label: i18n.t('select.time.1_week', '1 week') }
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
      if (value === timeout) {
        return TIMEOUT_OPTIONS[idx];
      }
    }
    return null;
  }

  private isChecked(): boolean {
    return this.props.timeout > 0;
  }

  private getInstructions(): string {
    const base = i18n.t('get_instructions', 'Continue when there is no response');
    return this.isChecked() ? `${base} ${i18n.t('for', 'for')}` : ellipsize(base);
  }

  private handleChecked(): void {
    if (this.props.timeout > 0) {
      this.props.onChanged(0);
    } else {
      this.props.onChanged(DEFAULT_TIMEOUT.value);
    }
  }

  private handleTimeoutChanged(selected: any): void {
    this.props.onChanged(selected.value as number);
  }

  public render(): JSX.Element {
    return (
      <div className={styles.timeout_control_container}>
        <div className={styles.left_section}>
          <CheckboxElement
            name={i18n.t('Timeout', 'Timeout')}
            checked={this.isChecked()}
            description={this.getInstructions()}
            checkboxClassName={styles.checkbox}
            onChange={this.handleChecked}
          />
        </div>
        {renderIf(this.isChecked())(
          <div className={styles.drop_down}>
            <Select
              name={i18n.t('timeout', 'timeout')}
              menuPlacement="auto"
              styles={small as any}
              isClearable={false}
              isSearchable={false}
              value={this.getSelected(this.props.timeout)}
              onChange={this.handleTimeoutChanged}
              options={TIMEOUT_OPTIONS}
            />
          </div>
        )}
      </div>
    );
  }
}
