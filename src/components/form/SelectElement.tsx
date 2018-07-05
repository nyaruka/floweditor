import * as React from 'react';
import Select from 'react-select';

import FormElement, { FormElementProps } from './FormElement';

interface SelectElementProps extends FormElementProps {
    onChange(value: any): void;
    defaultValue: any;
    options: any;
    placeholder?: string;
}

interface SelectElementState {
    value: any;
}

export default class SelectElement extends React.Component<SelectElementProps, SelectElementState> {
    constructor(props: any) {
        super(props);

        this.state = {
            value: this.props.defaultValue
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(value: any) {
        this.setState(
            {
                value: value.value
            },
            () => {
                if (this.props.onChange) {
                    this.props.onChange(value);
                }
            }
        );
    }

    public render() {
        return (
            <FormElement name={this.props.name}>
                <Select
                    name={this.props.name}
                    value={this.state.value}
                    onChange={this.onChange}
                    searchable={false}
                    clearable={false}
                    options={this.props.options}
                />
            </FormElement>
        );
    }
}
