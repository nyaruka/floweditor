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

const FormElement: React.SFC<FormElementProps> = (props): JSX.Element => {
    const errorDivs: JSX.Element[] = props.errors
        ? props.errors.map((error, idx) => (
              <div key={idx} className={styles.error}>
                  {error}
              </div>
          ))
        : [];

    const errorsToDisplay: JSX.Element =
        errorDivs.length > 0 ? <div className={styles.error}>{errorDivs}</div> : null;

    const name: JSX.Element =
        props.showLabel && props.name ? <div className={styles.label}>{props.name}</div> : null;

    const helpText: JSX.Element =
        props.helpText && !errorsToDisplay ? (
            <div className={styles.helpText}>{props.helpText}</div>
        ) : null;

    const classes = [styles.ele];

    if (props.__className) {
        classes.push(props.__className);
    }

    if (props.border) {
        classes.push(styles.border);
    }

    return (
        <div className={classes.join(' ')}>
            {name}
            {props.children}
            <div>
                {helpText}
                {errorsToDisplay}
            </div>
        </div>
    );
};

export default FormElement;
