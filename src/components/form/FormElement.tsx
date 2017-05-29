import * as React from "react";

var styles = require('./FormElement.scss');

export interface FormElementProps {
    name: string;
    helpText?: string;
    errors?: string[];

    showLabel?: boolean;
    required?: boolean;
    className?: string;
}

export class FormElement extends React.PureComponent<FormElementProps, {}> {

    render() {

        var errors: JSX.Element[] = [];
        if (this.props.errors) {
            this.props.errors.map((error)=>{
                errors.push(<div key={Math.random()} className={styles.error}>{error}</div>);
            });
        }

        var errorDisplay = null;
        if (errors.length > 0) {
            errorDisplay = (
                <div className={styles.errors}>
                  {errors}
                </div>
            );
        }

        var name = this.props.showLabel && this.props.name ? <div>{this.props.name}</div> : "";
        var helpText = this.props.helpText && !errorDisplay ? <div className={styles["help-text"]}>{this.props.helpText}</div> : "";

        var classes = [styles.group];
        if (this.props.className) {
            classes.push(this.props.className);
        }

        return (
            <div className={classes.join(" ")}>
                <div className={styles.label}>
                    {name}
                </div>
                {this.props.children}
                <div className={styles.bottom}>
                    {helpText}
                    {errorDisplay}
                </div>
            </div>
        );
    }
}
