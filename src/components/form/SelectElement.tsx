import * as React from 'react';

import { FormElement, IFormElementProps } from './FormElement';
import { FormWidget, IFormValueState } from './FormWidget';
import Select from 'react-select';

var styles = require('./FormElement.scss');

interface ISelectElementProps extends IFormElementProps {
    onChange(value: any): void;
    defaultValue: any;
    options: any;
    placeholder?: string;
}

export class SelectElement extends FormWidget<ISelectElementProps, IFormValueState> {
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
        var errors: string[] = [];
        if (this.props.required) {
            if (!this.state.value || this.state.value.length == 0) {
                errors.push(this.props.name + ' is required');
            }
        }

        this.setState({ errors: errors });
        return errors.length == 0;
    }

    render() {
        var classes = [];
        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes.push('select-invalid');
        }

        return (
            <FormElement
                name={this.props.name}
                required={this.props.required}
                errors={this.state.errors}>
                <Select
                    name={this.props.name}
                    value={this.state.value}
                    onChange={this.onChange.bind(this)}
                    searchable={false}
                    clearable={false}
                    options={this.props.options}
                />
            </FormElement>
        );
    }
}
