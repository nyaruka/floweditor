import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import * as styles from '~/components/form/FormElement.scss';
import { FormEntry } from '~/store/nodeEditor';
import { renderIf } from '~/utils';

const cx = classNames.bind(styles);

export interface FormElementProps {
    name: string;
    helpText?: string;
    entry?: FormEntry;
    showLabel?: boolean;
    __className?: string;
    border?: boolean;
    sendMsgError?: boolean;
    kaseError?: boolean;
    attribError?: boolean;
}

export default class FormElement extends React.PureComponent<FormElementProps> {
    constructor(props: FormElementProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^get/, /^has/]
        });
    }
    private getName(): JSX.Element {
        return renderIf(
            this.props.showLabel &&
                this.props.name !== undefined &&
                this.props.name !== null &&
                this.props.name.length > 0
        )(<div className={styles.label}>{this.props.name}</div>);
    }

    private getHelpText(): JSX.Element {
        return renderIf(this.props.helpText != null)(
            <div className={styles.helpText}>{this.props.helpText} </div>
        );
    }

    private hasErrors(): boolean {
        return (
            this.props.entry &&
            this.props.entry.validationFailures &&
            this.props.entry.validationFailures.length > 0
        );
    }

    private getErrors(): JSX.Element {
        if (this.hasErrors()) {
            const errors = this.props.entry.validationFailures.map((failure, idx) => {
                const className = cx({
                    [styles.error]: true,
                    [styles.sendMsgError]: this.props.sendMsgError === true
                    // [styles.kaseError]: this.props.kaseError === true,
                    // [styles.attribError]: this.props.attribError === true
                });
                return (
                    <div key={idx} className={className}>
                        <div className={styles.arrowUp} />
                        <div>{failure.message}</div>
                    </div>
                );
            });
            return <div className={styles.errorList}>{errors}</div>;
        }
        return null;
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
                {helpText}
                {errorsToDisplay}
            </div>
        );
    }
}
