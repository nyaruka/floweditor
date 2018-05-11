import * as React from 'react';

import * as styles from './CheckboxElement.scss';
import FormElement, { FormElementProps } from './FormElement';

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

    private onChange(event: any): void {
        this.setState(
            { checked: !this.state.checked },
            () => this.props.onCheck && this.props.onCheck()
        );
    }

    public validate(): boolean {
        return true;
    }

    public render(): JSX.Element {
        const className: string = this.props.sibling === true ? styles.sibling : null;
        const checkboxIcon = this.state.checked ? 'fe-check-square' : 'fe-square';

        return (
            <FormElement
                __className={styles.sibling}
                border={this.props.border}
                name={this.props.name}
                required={this.props.required}
                errors={this.state.errors}
            >
                <div className={styles.label} onClick={this.onChange}>
                    <span className={checkboxIcon} />
                    <div className={styles.title}>{this.props.name}</div>
                    <div className={styles.description}>{this.props.description}</div>
                </div>
            </FormElement>
        );
    }
}
