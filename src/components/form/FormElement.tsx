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
        props.errors.map(error => {
            errors = [
                ...errors,
                <div key={Math.random()} className={styles.error}>
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
        helpText =  <div className={styles.help_text}>{props.helpText}</div>;
    } else {
        helpText = '';
    }

    let classes = [styles.group, styles.ele];

    if (props.className) {
        classes = [...classes, props.className];
    }

    if (props.border) {
        classes = [...classes, props.className];
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
