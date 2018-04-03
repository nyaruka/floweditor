import * as classNames from 'classnames/bind';
import * as React from 'react';
import * as styles from './FormElement.scss';

const cx = classNames.bind(styles);

export interface FormElementProps {
    name: string;
    helpText?: string;
    errors?: string[];
    showLabel?: boolean;
    required?: boolean;
    __className?: string;
    border?: boolean;
    sendMsgError?: boolean;
    kaseError?: boolean;
    attribError?: boolean;
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
        if (this.props.errors.length < 1) {
            return null;
        }

        const errors: JSX.Element[] = this.props.errors.map((error, idx) => {
            const className = cx({
                [styles.error]: true,
                [styles.sendMsgError]: this.props.sendMsgError === true,
                [styles.kaseError]: this.props.kaseError === true,
                [styles.attribError]: this.props.attribError === true
            });

            return (
                <div key={idx} className={className}>
                    {error}
                </div>
            );
        });

        return <div className={styles.error}>{errors}</div>;
    }

    public render(): JSX.Element {
        const name: JSX.Element = this.getName();
        const helpText: JSX.Element = this.getHelpText();
        const errorsToDisplay: JSX.Element = this.getErrors();

        const className = cx({
            [styles.ele]: true,
            [styles.border]: this.props.border,
            [this.props.__className]: this.props.__className !== undefined
        });

        return (
            <div className={className}>
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
