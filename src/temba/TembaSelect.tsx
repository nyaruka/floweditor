import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

export interface TembaSelectProps {
  name: string;
  options: any[];
  value: any;
  onChange: (option: any) => void;

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

  public getValue(option: any): string {
    return option[this.props.valueKey || 'value'];
  }

  public isMatch(a: any, b: any): boolean {
    if (a && b) {
      return this.getValue(a) === this.getValue(b);
    }
    return false;
  }

  public componentDidMount(): void {
    this.selectbox.addEventListener('temba-selection', (event: any) => {
      const eventOption = event.detail.selected;
      const resolved = this.props.options.find(
        (option: any) => this.getValue(option) === eventOption.value
      );
      this.props.onChange(resolved);
    });
  }

  public render(): JSX.Element {
    return (
      <temba-select
        ref={(ele: any) => {
          this.selectbox = ele;
        }}
        searchable
      >
        {this.props.options.map((option: any) => {
          const selected = this.isMatch(this.props.value, option) ? { selected: true } : {};
          const optionValue = this.getValue(option);
          return (
            <temba-option
              key={this.props.name + '_' + optionValue}
              name={option[this.props.nameKey || 'name']}
              value={optionValue}
              {...selected}
            ></temba-option>
          );
        })}
      </temba-select>
    );
  }
}
