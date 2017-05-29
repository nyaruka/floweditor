import * as React from "react";

import {FormElement, FormElementProps} from './FormElement';
import {FormWidget, FormValueState} from './FormWidget';
var Select = require('react-select');

var styles = require("./FormElement.scss");

interface EmailElementProps extends FormElementProps {
    emails: string[];
    placeholder?: string;
}

interface EmailState extends FormValueState {
    emails: {label: string, value: string}[];
}

export class EmailElement extends FormWidget<EmailElementProps, EmailState> {

    private emailPattern = /\S+@\S+\.\S+/;

    constructor(props: any) {
        super(props);

        var emails: {label: string, value: string}[] = [];
        if (this.props.emails) {
            for (let initial of this.props.emails) {
                emails.push({label: initial, value: initial});
            }
        }

        this.state = {
            emails: emails,
            errors: []
        }
    }

    validate(): boolean {
        var errors: string[] = []
        if (this.props.required){
            if (this.state.emails.length == 0) {
                errors.push(this.props.name + " is required");
            }
        }

        this.setState({errors: errors});
        return errors.length == 0;
    }

    private onChangeEmails(emails: {label: string, value: string}[]) {
        this.setState({
            emails: emails
        });
    }

    private validEmailPrompt(value: string): string {
        return "Send email to " + value;
    }

    private isValidEmail(value: {label: string}): boolean {
        return this.emailPattern.test(value.label);
    }

    render() {
        var classes = [];
        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes.push("select-invalid");
        }

        return (
            <FormElement name={this.props.name} required={this.props.required} errors={this.state.errors}>
                <Select.Creatable
                    className={classes.join(" ")}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    value={this.state.emails}
                    onChange={this.onChangeEmails.bind(this)}
                    multi={true}
                    searchable={true}
                    clearable={false}
                    noResultsText={"Enter an email address"}
                    isValidNewOption={this.isValidEmail.bind(this)}
                    promptTextCreator={this.validEmailPrompt.bind(this)}
                    arrowRenderer={()=>{return <div/>}}
                    options={[]}
                />
            </FormElement>
        )
    }
}
