import * as React from 'react';

import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormWidgetState } from './FormWidget';
import Select from 'react-select';

var styles = require('./FormElement.scss');

interface SelectElementProps extends FormElementProps {
    onChange(value: any): void;
    defaultValue: any;
    options: any;
    placeholder?: string;
}

export class SelectElement extends FormWidget<SelectElementProps, FormWidgetState> {
    constructor(props: any) {
        super(props);
        this.state = {
            value: this.props.defaultValue,
            errors: []
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

    validate(): boolean {
        let errors: string[] = [];

        if (this.props.required) {
            if (!this.state.value || this.state.value.length == 0) {
                errors = [...errors, `${this.props.name} is required`];
            }
        }

        this.setState({ errors });

        return errors.length == 0;
    }

    render() {
        let classes: string[] = [];

        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes = [...classes, 'select-invalid'];
        }

        return (
            <FormElement
                name={this.props.name}
                required={this.props.required}
                errors={this.state.errors}>
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
