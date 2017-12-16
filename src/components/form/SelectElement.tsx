import * as React from 'react';
import Select from 'react-select';
import FormElement, { FormElementProps } from './FormElement';
import { getSelectClass } from '../../helpers/utils';

import * as styles from './FormElement.scss';

interface SelectElementProps extends FormElementProps {
    onChange(value: any): void;
    defaultValue: any;
    options: any;
    placeholder?: string;
}

interface SelectElementState {
    value: any;
    errors: string[];
}

export default class SelectElement extends React.Component<SelectElementProps, SelectElementState> {
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
        const errors: string[] = [];

        if (this.props.required) {
            if (!this.state.value || this.state.value.length === 0) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    render() {
        const classes: string[] = getSelectClass(this.state.errors.length);

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
