import * as classNames from 'classnames/bind';
import * as React from 'react';

import { FormEntry } from '../../store/nodeEditor';
import { renderIf } from '../../utils';
import * as styles from './FormElement.scss';

const cx = classNames.bind(styles);

export interface FormElementProps {
    name: string;
    helpText?: string;
    errors?: string[];
    entry?: FormEntry;
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
        return renderIf(
            this.props.showLabel &&
                this.props.name !== undefined &&
                this.props.name !== null &&
                this.props.name.length > 0
        )(<div className={styles.label}>{this.props.name}</div>);
    }

    private getHelpText(): JSX.Element {
        return renderIf(this.props.helpText && !this.props.errors.length)(
            <div className={styles.helpText}>{this.props.helpText} </div>
        );
    }

    private getErrors(): JSX.Element {
        let errors: JSX.Element[] = (this.props.errors || []).map((error, idx) => {
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

        if (this.props.entry && this.props.entry.validationFailures) {
            errors = errors.concat(
                this.props.entry.validationFailures.map((failure, idx) => {
                    const className = cx({
                        [styles.error]: true,
                        [styles.sendMsgError]: this.props.sendMsgError === true,
                        [styles.kaseError]: this.props.kaseError === true,
                        [styles.attribError]: this.props.attribError === true
                    });
                    return (
                        <div key={idx} className={className}>
                            {failure.message}
                        </div>
                    );
                })
            );
        }

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
