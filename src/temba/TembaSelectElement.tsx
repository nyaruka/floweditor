import TembaSelect, { TembaSelectProps } from './TembaSelect';
import FormElement from 'components/form/FormElement';
import * as React from 'react';
import { FormEntry } from 'store/nodeEditor';

export interface TembaSelectElementProps extends TembaSelectProps {
  entry: FormEntry;
  showLabel?: boolean;
  helpText?: string | JSX.Element;
}

/** Simple wrapper for TembaSelect to show form errors */
export default class TembaSelectElement extends React.Component<TembaSelectElementProps> {
  public render(): JSX.Element {
    return (
      <FormElement
        name={this.props.name}
        entry={this.props.entry}
        showLabel={this.props.showLabel}
        helpText={this.props.helpText}
      >
        <TembaSelect {...this.props} value={this.props.entry?.value}></TembaSelect>
      </FormElement>
    );
  }
}
