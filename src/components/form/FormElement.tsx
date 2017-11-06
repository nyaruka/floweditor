import * as React from 'react';

var styles = require('./FormElement.scss');

export interface IFormElementProps {
    name: string;
    helpText?: string;
    errors?: string[];

    showLabel?: boolean;
    required?: boolean;
    className?: string;
    border?: boolean;
}

export class FormElement extends React.PureComponent<IFormElementProps, {}> {
    render() {
        var errors: JSX.Element[] = [];
        if (this.props.errors) {
            this.props.errors.map(error => {
                errors.push(
                    <div key={Math.random()} className={styles.error}>
                        {error}
                    </div>
                );
            });
        }

        var errorDisplay = null;
        if (errors.length > 0) {
            errorDisplay = <div className={styles.errors}>{errors}</div>;
        }

        var name = null;
        if (this.props.showLabel && this.props.name) {
            name = <div className={styles.label}>{this.props.name}</div>;
        }

        var helpText =
            this.props.helpText && !errorDisplay ? (
                <div className={styles.help_text}>{this.props.helpText}</div>
            ) : (
                ''
            );

        var classes = [styles.group, styles.ele];
        if (this.props.className) {
            classes.push(this.props.className);
        }

        if (this.props.border) {
            classes.push(styles.border);
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
