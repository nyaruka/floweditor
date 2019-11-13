import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import * as React from 'react';
import { FormEntry, ValidationFailure } from 'store/nodeEditor';
import { renderIf } from 'utils';

import styles from './FormElement.module.scss';

const cx: any = classNames.bind(styles);

export interface FormElementProps {
  name: string;
  helpText?: string | JSX.Element;
  entry?: FormEntry;
  showLabel?: boolean;
  __className?: string;
  border?: boolean;
  sendMsgError?: boolean;
  kaseError?: boolean;
  attribError?: boolean;
  hideError?: boolean;
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
      <div className={styles.help_text}>{this.props.helpText} </div>
    );
  }

  private hasErrors(): boolean {
    return this.getMergedErrors().length > 0;
  }

  private getMergedErrors(): ValidationFailure[] {
    if (this.props.entry) {
      return (this.props.entry.validationFailures || []).concat(
        this.props.entry.persistantFailures || []
      );
    }
    return [];
  }

  private getErrors(): JSX.Element {
    if (this.hasErrors() && !this.props.hideError) {
      const errors = this.getMergedErrors().map((failure, idx) => {
        const className = cx({
          [styles.error]: true,
          [styles.send_msg_error]: this.props.sendMsgError === true
        });
        return (
          <div key={idx} className={className}>
            <div className={styles.arrow_up} />
            <div>{failure.message}</div>
          </div>
        );
      });
      return <div className={styles.error_list}>{errors}</div>;
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
      [styles.invalid]: this.hasErrors(),
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
