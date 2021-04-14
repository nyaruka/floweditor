import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { bool, snakify } from 'utils';
import styles from './TembaSelect.module.scss';
import { Assets } from 'store/flowContext';

export enum TembaSelectStyle {
  small = 'small',
  normal = 'normal'
}

export interface TembaSelectProps {
  name: string;
  options?: any[];
  value: any;
  onChange: (option: any) => void;
  onFocus?: () => void;
  shouldExclude?: (option: any) => boolean;
  disabled?: boolean;

  createPrefix?: string;
  expressions?: boolean;
  assets?: Assets;
  errors?: string[];
  style?: TembaSelectStyle;

  placeholder?: string;
  searchable?: boolean;
  multi?: boolean;
  tags?: boolean;

  cacheKey?: string;

  getName?: (option: any) => string;

  nameKey?: string;
  valueKey?: string;

  sortFunction?(a: any, b: any): number;

  hideError?: boolean;

  clearable?: boolean;

  queryParam?: string;
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
    let name = '';
    if (this.props.getName) {
      name = this.props.getName(option);
    }

    if (!name && this.props.nameKey in option) {
      name = option[this.props.nameKey];
    }

    if (!name && 'label' in option) {
      name = option['label'];
    }

    if (!name) {
      name = option['name'];
    }
    return name;
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

  public componentDidUpdate(prevProps: TembaSelectProps): void {
    if (this.props.options !== prevProps.options) {
      const selectbox = this.selectbox as any;
      if (selectbox.setOptions) {
        selectbox.setOptions(this.props.options);
      }
    }
  }

  public componentDidMount(): void {
    const select = this;
    // add the option to create groups abitrarily
    if (this.props.createPrefix) {
      (this.selectbox as any).createArbitraryOption = (input: string, options: any[]) => {
        if (input.indexOf('@') === -1) {
          var existing = options.find(function(option: any) {
            const name = select.getName(option);
            return !!(name.toLowerCase().trim() === input.toLowerCase().trim());
          });
          if (!existing) {
            return {
              prefix: this.props.createPrefix,
              name: input,
              id: 'created'
            };
          }
        }
      };
    }

    const selectbox = this.selectbox as any;

    if (this.props.options) {
      if (selectbox.setOptions) {
        selectbox.setOptions(this.props.options);
      }
    }

    if (this.props.sortFunction) {
      selectbox.sortFunction = this.props.sortFunction;
    }

    if (this.props.shouldExclude) {
      selectbox.shouldExclude = this.props.shouldExclude;
    }

    selectbox.getName = select.getName.bind(select);

    this.selectbox.addEventListener('change', (event: any) => {
      const values = event.target.values || [event.target.value];

      let resolved = values;

      if (!this.props.assets && !this.props.tags) {
        resolved = values.map((op: any) => {
          const result = (this.props.options || []).find(
            (option: any) => this.getValue(option) === this.getValue(op)
          );
          if (!result && this.props.createPrefix) {
            return op;
          }
          return result;
        });

        resolved.forEach((option: any) => {
          if (!option) {
            throw new Error('No option found for selection');
          }
        });
      }

      if (this.props.onChange) {
        if (this.props.multi) {
          this.props.onChange(resolved);
        } else {
          this.props.onChange(resolved[0]);
        }
      }
    });
  }

  public isFocused(): boolean {
    return (this.selectbox as any).focused;
  }

  public render(): JSX.Element {
    let selectedArray: any[] = [];
    if (this.props.value && !Array.isArray(this.props.value)) {
      selectedArray = [this.props.value];
    } else if (Array.isArray(this.props.value)) {
      selectedArray = this.props.value;
    }

    const values = JSON.stringify(selectedArray);

    return (
      <div
        className={
          styles[this.props.style || TembaSelectStyle.normal] +
          ' ' +
          ((this.props.errors || []).length > 0 ? styles.error : '')
        }
      >
        <temba-select
          ref={(ele: any) => {
            this.selectbox = ele;
          }}
          data-testid={`temba_select_${snakify(this.props.name)}`}
          onFocus={this.props.onFocus}
          nameKey={this.props.nameKey || 'name'}
          valueKey={this.props.valueKey || 'value'}
          name={this.props.name}
          cacheKey={this.props.cacheKey}
          expressions={this.props.expressions ? 'session' : ''}
          endpoint={this.props.assets ? this.props.assets.endpoint : null}
          values={values}
          errors={JSON.stringify(this.props.errors ? this.props.errors : [])}
          hideErrors={this.props.hideError}
          placeholder={this.props.placeholder}
          searchable={bool(this.props.searchable)}
          multi={bool(this.props.multi)}
          disabled={this.props.disabled}
          clearable={this.props.clearable}
          tags={this.props.tags}
          queryParam={this.props.queryParam}
        />
      </div>
    );
  }
}
