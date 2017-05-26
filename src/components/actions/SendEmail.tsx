import * as React from 'react';
import {NodeEditorState} from '../../interfaces';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {SendEmailProps} from '../../interfaces';
import {NodeModalProps} from '../NodeModal';

var Select = require('react-select');

export class SendEmail extends Action<SendEmailProps> {
    renderNode(): JSX.Element {
        return <div>{this.props.subject}</div>
    }
}

interface SendEmailState {
    emails: {label: string, value: string}[]
}

export class SendEmailForm extends NodeForm<SendEmailProps, SendEmailState> {
    
    private emailPattern = /\S+@\S+\.\S+/;
    
    constructor(props: SendEmailProps) {
        super(props);

        var emails: {label: string, value: string}[] = [];
        if (this.props.emails) {
            for (let initial of this.props.emails) {
                emails.push({label: initial, value: initial});
            }
        }

        this.state = {
            emails: emails
        }
    }

    private validEmailPrompt(value: string): string {
        return "Send email to " + value;
    }

    private isValidEmail(value: {label: string}): boolean {
        return this.emailPattern.test(value.label);
    }

    private onChangeEmails(emails: {label: string, value: string}[]) {
        this.setState({
            emails: emails
        });
    }
    
    renderForm(): JSX.Element {
        return (
            <div>
                <div className="form-group">
                    <Select.Creatable
                        name="email"
                        className="method form-control"
                        placeholder="To"
                        value={this.state.emails}
                        onChange={this.onChangeEmails.bind(this)}
                        multi={true}
                        searchable={true}
                        clearable={false}
                        noResultsText="Enter an email address"
                        isValidNewOption={this.isValidEmail.bind(this)}
                        promptTextCreator={this.validEmailPrompt.bind(this)}
                        arrowRenderer={()=>{return <div/>}}
                        options={[]}
                    />
                    <div className="error"></div>
                </div>

                <div className="form-group">
                    <input placeholder="Subject" className="spacey subject" name="subject" defaultValue={this.props.subject}/>
                    <div className="error"></div>
                </div>

                <div className="form-group">
                    <textarea name="body" className="form-control definition" defaultValue={this.props.body}></textarea>
                    <div className="error"></div>
                </div>
            </div>
        )
    }

    validate(control: any): string {
        console.log(control);
        if (control.name == "body") {
            let textarea = control as HTMLTextAreaElement;
            if (textarea.value.trim().length == 0) {
                return "Message body is required";
            }
        }

        else if (control.name == "subject") {
            let input = control as HTMLInputElement;
            if (input.value.trim().length == 0) {
                return "Subject is required";
            }
        }
        return null;
    }
    
    submit(form: HTMLFormElement, modal: NodeModalProps) {
        var subject: HTMLInputElement = $(form).find('.subject')[0] as HTMLInputElement;
        var textarea: HTMLTextAreaElement = $(form).find('textarea')[0] as HTMLTextAreaElement;

        var emails: string[] = []
        for (let email of this.state.emails) {
            emails.push(email.value);
        }

        modal.onUpdateAction({
            uuid: this.props.uuid, 
            type: "email", 
            body: textarea.value,
            subject: subject.value,
            emails: emails
        } as SendEmailProps);
    }
}