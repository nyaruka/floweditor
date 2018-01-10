import * as React from 'react';

import * as styles from './FormElement.scss';

export interface FormElementProps {
    name: string;
    helpText?: string;
    errors?: string[];
    showLabel?: boolean;
    required?: boolean;
    __className?: string;
    border?: boolean;
    kase?: boolean;
}

export default class FormElement extends React.PureComponent<FormElementProps> {
    private getName(): JSX.Element {
        if (this.props.showLabel && this.props.name) {
            return <div className={styles.label}>{this.props.name}</div>;
        }

        return null;
    }

    private getHelpText(): JSX.Element {
        if (this.props.helpText && !this.props.errors.length) {
            return <div className={styles.helpText}>{this.props.helpText} </div>;
        }

        return null;
    }

    private getErrors(): JSX.Element {
        let errors: JSX.Element[];

        if (this.props.errors) {
            errors = this.props.errors.map((error, idx) => (
                <div key={idx} className={styles.error}>
                    {error}
                </div>
            ));
        } else {
            errors = [];
        }

        if (errors.length > 0) {
            return <div className={styles.error}>{errors}</div>;
        }

        return null;
    }
    public render(): JSX.Element {
        const name: JSX.Element = this.getName();
        const helpText: JSX.Element = this.getHelpText();
        const errorsToDisplay: JSX.Element = this.getErrors();

        const classes = [styles.ele];

        if (this.props.__className) {
            classes.push(this.props.__className);
        }

        if (this.props.border) {
            classes.push(styles.border);
        }

        return (
            <div className={classes.join(' ')}>
                {name}
                {this.props.children}
                <div>
                    {helpText}
                    {errorsToDisplay}
                </div>
            </div>
        );
    }
}
