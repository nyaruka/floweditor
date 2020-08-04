import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { bool, snakify } from 'utils';
import styles from './TembaSelect.module.scss';

export enum TembaSelectStyle {
  small = 'small',
  normal = 'normal'
}

export interface TembaSelectProps {
  name: string;
  options: any[];
  value: any;
  onChange: (option: any) => void;

  error?: boolean;
  style?: TembaSelectStyle;

  placeholder?: string;
  searchable?: boolean;
  multi?: boolean;

  nameKey?: string;
  valueKey?: string;
}

interface TembaSelectState {}

export default class TembaSelect extends React.Component<TembaSelectProps, TembaSelectState> {
  private selectbox: HTMLElement;

  constructor(props: TembaSelectProps) {
    super(props);

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public getName(option: any): string {
    if (this.props.nameKey in option) {
      return option[this.props.nameKey];
    }

    if ('label' in option) {
      return option['label'];
    }

    return option['name'];
  }

  public getValue(option: any): string {
    return option[this.props.valueKey || 'value'];
  }

  public isMatch(a: any, b: any): boolean {
    if (a && b) {
      if (Array.isArray(a)) {
        return a.find((option: any) => this.getValue(option) === this.getValue(b));
      } else {
        return this.getValue(a) === this.getValue(b);
      }
    }
    return false;
  }

  public componentDidMount(): void {
    this.selectbox.addEventListener('change', (event: any) => {
      const values = event.target.values || [event.target.value];
      const resolved = values.map((op: any) => {
        return this.props.options.find((option: any) => this.getValue(option) === op.value);
      });

      resolved.forEach((option: any) => {
        if (!option) {
          throw new Error('No option found for selection');
        }
      });

      if (this.props.multi) {
        this.props.onChange(resolved);
      } else {
        this.props.onChange(resolved[0]);
      }
    });
  }

  public getOption(item: any): any {
    const value = this.getValue(item);
    const name = this.getName(item);
    return { name, value };
  }

  public render(): JSX.Element {
    const options = JSON.stringify(
      this.props.options.map((option: any) => {
        return this.getOption(option);
      })
    );

    const values = this.props.value ? JSON.stringify([this.getOption(this.props.value)]) : '[]';

    return (
      <div
        className={
          styles[this.props.style || TembaSelectStyle.normal] +
          ' ' +
          (this.props.error ? styles.error : '')
        }
      >
        <temba-select
          name={this.props.name}
          data-testid={`temba_select_${snakify(this.props.name)}`}
          ref={(ele: any) => {
            this.selectbox = ele;
          }}
          options={options}
          values={values}
          placeholder={this.props.placeholder}
          searchable={bool(this.props.searchable)}
          multi={bool(this.props.multi)}
        />
      </div>
    );
  }
}
