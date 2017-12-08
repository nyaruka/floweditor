import * as React from 'react';

const styles = require('./FormElement.scss');

export interface FormElementProps {
    name: string;
    helpText?: string;
    errors?: string[];
    showLabel?: boolean;
    required?: boolean;
    className?: string;
    border?: boolean;
}

const FormElement: React.SFC<FormElementProps> = (props): JSX.Element => {
    let errors: JSX.Element[] = [];

    if (props.errors) {
        props.errors.map((error, idx) => {
            errors = [
                ...errors,
                <div key={idx} className={styles.error}>
                    {error}
                </div>
            ];
        });
    }

    let errorDisplay: JSX.Element = null;

    if (errors.length > 0) {
        errorDisplay = <div className={styles.errors}>{errors}</div>;
    }

    let name: JSX.Element = null;

    if (props.showLabel && props.name) {
        name = <div className={styles.label}>{props.name}</div>;
    }

    let helpText: JSX.Element | string;

    if (props.helpText && !errorDisplay) {
        helpText = <div className={styles.help_text}>{props.helpText}</div>;
    } else {
        helpText = '';
    }

    const classes = [styles.group, styles.ele];

    if (props.className) {
        classes.push(props.className);
    }

    if (props.border) {
        classes.push(styles.border);
    }

    return (
        <div className={classes.join(' ')}>
            {name}
            {props.children}
            <div className={styles.bottom}>
                {helpText}
                {errorDisplay}
            </div>
        </div>
    );
};

export default FormElement;
