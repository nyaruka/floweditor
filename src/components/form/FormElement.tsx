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

export class FormElement extends React.PureComponent<FormElementProps, {}> {
    render() {
        let errors: JSX.Element[] = [];
        if (this.props.errors) {
            this.props.errors.map(error => {
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

        if (this.props.showLabel && this.props.name) {
            name = <div className={styles.label}>{this.props.name}</div>;
        }

        let helpText: JSX.Element | string;

        if (this.props.helpText && !errorDisplay) {
            helpText =  <div className={styles.help_text}>{this.props.helpText}</div>;
        } else {
            helpText = '';
        }

        let classes = [styles.group, styles.ele];

        if (this.props.className) {
            classes = [...classes, this.props.className];
        }

        if (this.props.border) {
            classes = [...classes, this.props.className];
        }

        return (
            <div className={classes.join(' ')}>
                {name}
                {this.props.children}
                <div className={styles.bottom}>
                    {helpText}
                    {errorDisplay}
                </div>
            </div>
        );
    }
}
