import * as React from 'react';
import {FlowComp} from './Flow';
import * as Interfaces from '../interfaces';

export abstract class ActionForm {
    
    props: Interfaces.ActionProps;
    constructor(props: Interfaces.ActionProps) {
        this.props = props;
    }
    

    abstract renderTitle(): JSX.Element;
    abstract renderForm(): JSX.Element;
    abstract submit(form: Element, flow: FlowComp): void;

    public getClassName() {
        return this.props.type.split('_').join('-');
    }
}

export class SendMessageForm extends ActionForm {

    props: Interfaces.SendMessageProps;
    constructor(props: Interfaces.SendMessageProps) {
        super(props);
    }

    renderTitle() {
        return <span>Send Message</span> 
    }

    renderForm() {
        return <textarea className="definition" defaultValue={this.props.text}></textarea>
    }

    submit(form: Element, flow: FlowComp) {
        var textarea: HTMLTextAreaElement = $(form).find('textarea')[0] as HTMLTextAreaElement;
        flow.updateAction(this.props.uuid, {text: {$set: textarea.value}});
    }
}

export class AddToGroupForm extends ActionForm {

    props: Interfaces.AddToGroupProps;
    constructor(props: Interfaces.AddToGroupProps) {
        super(props);
    }

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
    constructor(props: Interfaces.SaveToContactProps) {
        super(props);
    }

    renderTitle(): JSX.Element {
        throw new Error('Method not implemented.');
    }
    renderForm(): JSX.Element {
        throw new Error('Method not implemented.');
    }
    submit(form: Element, flow: FlowComp): void {
        throw new Error('Method not implemented.');
    }
}

export class SetLanguageForm extends ActionForm {

    props: Interfaces.SetLanguageProps;
    constructor(props: Interfaces.SetLanguageProps) {
        super(props);
    }

    renderTitle(): JSX.Element {
        throw new Error('Method not implemented.');
    }
    renderForm(): JSX.Element {
        throw new Error('Method not implemented.');
    }
    submit(form: Element, flow: FlowComp): void {
        throw new Error('Method not implemented.');
    }


}