import * as React from 'react';
import Select from 'react-select';
import FormElement, { FormElementProps } from './FormElement';

import * as styles from './CheckboxElement.scss';

interface CheckboxElementProps extends FormElementProps {
    defaultValue?: boolean;
    description?: string;
    border?: boolean;
    onCheck?(): void;
    sibling?: boolean;
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

    private onChange(event: React.FormEvent<HTMLInputElement>): void {
        const { currentTarget: { checked } } = event;

        this.setState(
            {
                checked
            },
            () => this.props.onCheck && this.props.onCheck()
        );
    }

    public validate(): boolean {
        return true;
    }

    public render(): JSX.Element {
        const className: string = this.props.sibling === true ? styles.sibling : null;

        return (
            <FormElement
                __className={styles.sibling}
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
