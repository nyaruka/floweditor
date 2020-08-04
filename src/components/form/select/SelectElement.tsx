import FormElement, { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';
import TembaSelect, { TembaSelectStyle } from 'temba/TembaSelect';
import { hasErrors } from 'components/flow/actions/helpers';

interface SelectElementProps extends FormElementProps {
  onChange?(value: any, action?: any): void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  options: any;

  style?: TembaSelectStyle;
  placeholder?: string;
  clearable?: boolean;

  multi?: boolean;
  styles?: any;
}

export interface SelectOption {
  label: string;
  value: string;
}

export default class SelectElement extends React.Component<SelectElementProps> {
  public render(): JSX.Element {
    return (
      <FormElement name={this.props.name} entry={this.props.entry}>
        <TembaSelect
          key={this.props.name + '_select'}
          name={this.props.name}
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
          value={this.props.entry.value}
          options={this.props.options}
          searchable={false}
          error={hasErrors(this.props.entry)}
          style={this.props.style}
          multi={this.props.multi}
        ></TembaSelect>
      </FormElement>
    );
  }
}
