import FormElement, { FormElementProps } from 'components/form/FormElement';
import * as React from 'react';
import TembaSelect from 'temba/TembaSelect';

interface SelectElementProps extends FormElementProps {
  onChange?(value: any, action?: any): void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  options: any;
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
  /* private getStyle(): any {
    let style = this.props.styles || large;
    if (hasErrors(this.props.entry)) {
      const erroredControl = getErroredSelect(style.control({}, {}));
      style = { ...style, ...erroredControl };
    }
    return style;
  }*/

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
          multi={this.props.multi}
        ></TembaSelect>
        {/*<Select
          isDisabled={this.props.onChange === undefined}
          placeholder={this.props.placeholder}
          styles={this.getStyle()}
          name={this.props.name}
          value={this.props.entry.value}
          onChange={this.props.onChange}
          onMenuOpen={this.props.onMenuOpen}
          onMenuClose={this.props.onMenuClose}
          isSearchable={false}
          isClearable={this.props.clearable}
          options={this.props.options}
          
        />*/}
      </FormElement>
    );
  }
}
