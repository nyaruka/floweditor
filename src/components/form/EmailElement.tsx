import * as React from 'react';

import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormWidgetState } from './FormWidget';

const Select = require('react-select');
const styles = require('./FormElement.scss');

interface EmailElementProps extends FormElementProps {
    emails: string[];
    placeholder?: string;
}

interface EmailState extends FormWidgetState {
    emails: { label: string; value: string }[];
}

export const transformEmails = (emails: string[]): { label: string; value: string }[] =>
    emails.map(email => ({ label: email, value: email }));

export class EmailElement extends FormWidget<EmailElementProps, EmailState> {
    private emailPattern = /\S+@\S+\.\S+/;

    constructor(props: any) {
        super(props);

        this.state = {
            emails: transformEmails(this.props.emails),
            errors: []
        };

        this.onChangeEmails = this.onChangeEmails.bind(this);
        this.isValidEmail = this.isValidEmail.bind(this);
        this.validEmailPrompt = this.validEmailPrompt.bind(this);
    }

    validate(): boolean {
        let errors: string[] = [];
        if (this.props.required) {
            if (this.state.emails.length === 0) {
                errors = [...errors, `${this.props.name} is required`];
            }
        }

        this.setState({ errors: errors });

        return errors.length === 0;
    }

    private onChangeEmails(emails: { label: string; value: string }[]) {
        this.setState({
            emails
        });
    }

    private validEmailPrompt(value: string): string {
        return `Send email to ${value}`;
    }

    private isValidEmail(value: { label: string }): boolean {
        return this.emailPattern.test(value.label);
    }

    private arrowRenderer(): JSX.Element {
        return <div />;
    }

    render() {
        let classes: string[] = [];

        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes = [...classes, 'select-invalid'];
        }

        return (
            <FormElement
                name={this.props.name}
                required={this.props.required}
                errors={this.state.errors}>
                <Select.Creatable
                    className={classes.join(' ')}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    value={this.state.emails}
                    onChange={this.onChangeEmails}
                    multi={true}
                    searchable={true}
                    clearable={false}
                    noResultsText={'Enter an email address'}
                    isValidNewOption={this.isValidEmail}
                    promptTextCreator={this.validEmailPrompt}
                    arrowRenderer={this.arrowRenderer}
                    options={[]}
                />
            </FormElement>
        );
    }
}
