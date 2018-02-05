import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { Creatable as SelectCreatable } from 'react-select';
import FormElement, { FormElementProps } from './FormElement';
import { getSelectClass } from '../../utils';

import * as styles from './FormElement.scss';

type EmailList = Array<{ label: string; value: string }>;

interface EmailElementProps extends FormElementProps {
    emails: string[];
    placeholder?: string;
}

interface EmailState {
    emails: EmailList;
    errors: string[];
}

export const transformEmails = (emails: string[]): EmailList =>
    emails.map(email => ({ label: email, value: email }));

export default class EmailElement extends React.Component<
    EmailElementProps,
    EmailState
> {
    private emailPattern: RegExp = /\S+@\S+\.\S+/;

    constructor(props: any) {
        super(props);

        const emails = transformEmails(this.props.emails || []);

        this.state = {
            emails,
            errors: []
        };

        bindCallbacks(this, {
            include: ['onChangeEmails', 'isValidEmail', 'validEmailPrompt']
        });
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (this.state.emails.length === 0) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    private onChangeEmails(emails: EmailList): void {
        this.setState({
            emails
        });
    }

    private validEmailPrompt(value: string): string {
        return `Send email to ${value}`;
    }

    private isValidEmail({ label }: { label: string }): boolean {
        return this.emailPattern.test(label);
    }

    private arrowRenderer(): JSX.Element {
        return <div />;
    }

    public render(): JSX.Element {
        const className = getSelectClass(this.state.errors.length);
        return (
            <FormElement
                name={this.props.name}
                required={this.props.required}
                errors={this.state.errors}>
                <SelectCreatable
                    className={className}
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
