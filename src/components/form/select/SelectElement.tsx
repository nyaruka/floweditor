import * as React from 'react';
import Select from 'react-select';

import FormElement, { FormElementProps } from '~/components/form/FormElement';

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

    private onChange(value: any): void {
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

    public render(): JSX.Element {
        return (
            <FormElement name={this.props.name}>
                <Select
                    joinValues={true}
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
