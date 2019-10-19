import FormElement, { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';
import Select from 'react-select';
import { StylesConfig } from 'react-select/lib/styles';
import { hasErrors } from 'components/flow/actions/helpers';
import { large, getErroredSelect } from 'utils/reactselect';

interface SelectElementProps extends FormElementProps {
  onChange?(value: any, action?: any): void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  options: any;
  placeholder?: string;
  styles?: StylesConfig;
}

export interface SelectOption {
  label: string;
  value: string;
}

export default class SelectElement extends React.Component<SelectElementProps> {
  private getStyle(): any {
    let style = this.props.styles || large;
    if (hasErrors(this.props.entry)) {
      const erroredControl = getErroredSelect(style.control({}, {}));
      style = { ...style, ...erroredControl };
    }
    return style;
  }

  public render(): JSX.Element {
    return (
      <FormElement name={this.props.name} entry={this.props.entry}>
        <Select
          isDisabled={this.props.onChange === undefined}
          placeholder={this.props.placeholder}
          styles={this.getStyle()}
          name={this.props.name}
          value={this.props.entry.value}
          onChange={this.props.onChange}
          onMenuOpen={this.props.onMenuOpen}
          onMenuClose={this.props.onMenuClose}
          isSearchable={false}
          isClearable={false}
          options={this.props.options}
        />
      </FormElement>
    );
  }
}
