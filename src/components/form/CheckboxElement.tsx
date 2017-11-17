import * as React from 'react';
import Select from 'react-select';
import FormElement, { FormElementProps } from './FormElement';

const styles = require('./CheckboxElement.scss');

interface CheckboxElementProps extends FormElementProps {
    defaultValue?: boolean;
    description?: string;
    border?: boolean;
}

interface CheckboxState {
    checked: boolean;
    errors: string[];
}

export default class CheckboxElement extends React.Component<CheckboxElementProps, CheckboxState> {
    constructor(props: any) {
        super(props);

        this.state = {
            checked: this.props.defaultValue,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(event: React.FormEvent<HTMLInputElement>) {
        const { currentTarget: { checked } } = event;

        this.setState({
            checked
        });
    }

    public validate(): boolean {
        return true;
    }

    public render(): JSX.Element {
        return (
            <FormElement
                border={this.props.border}
                name={this.props.name}
                required={this.props.required}
                errors={this.state.errors}>
                <label className={styles.label}>
                    <input
                        type="checkbox"
                        defaultChecked={this.state.checked}
                        onChange={this.onChange}
                    />
                    <div className={styles.title}>{this.props.name}</div>
                    <div className={styles.description}>{this.props.description}</div>
                </label>
            </FormElement>
        );
    }
}
