import * as React from 'react';
import {FlowComp} from './Flow';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';

export abstract class ActionForm {
    
    props: Interfaces.ActionProps;
    constructor(props: Interfaces.ActionProps) {
        this.props = props;
    }

    abstract renderTitle(): JSX.Element;
    abstract renderForm(): JSX.Element;
    abstract submit(context: Interfaces.FlowContext, form: Element): void;

    public getClassName() {
        return this.props.type.split('_').join('-');
    }
}

export class SendMessageForm extends ActionForm {

    props: Interfaces.SendMessageProps;
    
    renderTitle() { return <span>Send Message</span> }

    renderForm() { 
        return (
            <div>
                <span>Enter the message below blah blah blah</span>
                <textarea className="definition" defaultValue={this.props.text}></textarea>
            </div>
        )
    }

    submit(context: Interfaces.FlowContext, form: Element) {
        var textarea: HTMLTextAreaElement = $(form).find('textarea')[0] as HTMLTextAreaElement;
        context.flow.updateAction(this.props.uuid, {text: {$set: textarea.value}});
        Plumber.get().repaint(context.node.props.uuid);
    }
}

export class AddToGroupForm extends ActionForm {

    props: Interfaces.AddToGroupProps;

    renderTitle() {
        return <span>Add to Group</span>
    }

    renderForm() {
        return <textarea className="definition" defaultValue={this.props.label}></textarea>
    }

    submit() {

    }
}

export class SaveToContactForm extends ActionForm {

    props: Interfaces.SaveToContactProps;

    renderTitle(): JSX.Element {
        throw new Error('Method not implemented.');
    }
    renderForm(): JSX.Element {
        throw new Error('Method not implemented.');
    }

    submit(context: Interfaces.FlowContext, form: Element): void {
        throw new Error('Method not implemented.');
    }

}

export class SetLanguageForm extends ActionForm {

    props: Interfaces.SetLanguageProps;

    renderTitle(): JSX.Element {
        throw new Error('Method not implemented.');
    }
    renderForm(): JSX.Element {
        throw new Error('Method not implemented.');
    }
    submit(context: Interfaces.FlowContext, form: Element): void {
        throw new Error('Method not implemented.');
    }
}