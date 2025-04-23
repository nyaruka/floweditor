import TembaSelect, { TembaSelectProps } from './TembaSelect';
import FormElement from 'components/form/FormElement';
import * as React from 'react';
import { FormEntry } from 'store/nodeEditor';

export interface TembaSelectElementProps extends TembaSelectProps {
  entry: FormEntry;
}

/** Simple wrapper for TembaSelect to show form errors */
export default class TembaSelectElement extends React.Component<TembaSelectElementProps> {
  public render(): JSX.Element {
    return (
      <FormElement name={this.props.name} entry={this.props.entry}>
        <TembaSelect {...this.props} value={this.props.entry?.value}></TembaSelect>
      </FormElement>
    );
  }
}
