import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { bool } from 'utils';

export interface TembaSelectProps {
  name: string;
  options: any[];
  value: any;
  onChange: (option: any) => void;

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
    this.selectbox.addEventListener('temba-selection', (event: any) => {
      if (this.props.multi) {
        const resolved = (this.selectbox as any).values.map((op: any) => {
          return this.props.options.find((option: any) => this.getValue(option) === op.value);
        });
        this.props.onChange(resolved);
      } else {
        const eventOption = event.detail.selected;
        const resolved = this.props.options.find(
          (option: any) => this.getValue(option) === eventOption.value
        );
        this.props.onChange(resolved);
      }
    });
  }

  public render(): JSX.Element {
    return (
      <temba-select
        ref={(ele: any) => {
          this.selectbox = ele;
        }}
        placeholder={this.props.placeholder}
        searchable={bool(this.props.searchable)}
        multi={bool(this.props.multi)}
      >
        {this.props.options.map((option: any) => {
          const selected = this.isMatch(this.props.value, option) ? { selected: true } : {};

          const optionValue = this.getValue(option);
          const optionName = this.getName(option);

          return (
            <temba-option
              placeholder={this.props.placeholder}
              key={this.props.name + '_' + optionValue}
              name={optionName}
              value={optionValue}
              {...selected}
            ></temba-option>
          );
        })}
      </temba-select>
    );
  }
}
