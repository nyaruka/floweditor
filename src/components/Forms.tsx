import * as React from 'react';
import {FlowComp} from './Flow';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';

export abstract class FormHandler {
    
    props: Interfaces.NodeEditorProps;
    constructor(props: Interfaces.NodeEditorProps) {
        this.props = props;
    }

    abstract renderForm(): JSX.Element;
    abstract submit(context: Interfaces.FlowContext, form: Element): void;

    public getClassName() {
        return this.props.type.split('_').join('-');
    }
}

export class SendMessageForm extends FormHandler {

    props: Interfaces.SendMessageProps;
    
    renderForm() { 
        return (
            <div>
                <textarea className="definition" defaultValue={this.props.text}></textarea>
            </div>
        )
    }

    submit(context: Interfaces.FlowContext, form: Element) {
        var textarea: HTMLTextAreaElement = $(form).find('textarea')[0] as HTMLTextAreaElement;
        context.flow.updateAction(this.props.uuid, {text: {$set: textarea.value}});

        // our node size could have changed thanks to text changes
        Plumber.get().repaint(context.node.props.uuid);
    }
}

export class AddToGroupForm extends FormHandler {

    props: Interfaces.AddToGroupProps;

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {

    }
}

export class SaveToContactForm extends FormHandler {

    props: Interfaces.SaveToContactProps;

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }

}

export class SetLanguageForm extends FormHandler {

    props: Interfaces.SetLanguageProps;

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }
}

export class SwitchRouterForm extends FormHandler {
    
    renderForm(): JSX.Element {
        return <div>Rule editor goes here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}

export class WebhookForm extends FormHandler {

    renderForm(): JSX.Element {
        return <div>Webhook details go here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}