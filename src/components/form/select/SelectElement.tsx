import * as React from 'react';
import Select from 'react-select';
import { StylesConfig } from 'react-select/lib/styles';
import FormElement, { FormElementProps } from '~/components/form/FormElement';

interface SelectElementProps extends FormElementProps {
    onChange(value: any): void;
    options: any;
    placeholder?: string;
    styles?: StylesConfig;
}

export interface SelectOption {
    label: string;
    value: string;
}

export default class SelectElement extends React.Component<SelectElementProps> {
    constructor(props: any) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <FormElement name={this.props.name} entry={this.props.entry}>
                <Select
                    styles={this.props.styles}
                    name={this.props.name}
                    value={this.props.entry.value}
                    onChange={this.props.onChange}
                    isSearchable={false}
                    isClearable={false}
                    options={this.props.options}
                />
            </FormElement>
        );
    }
}
