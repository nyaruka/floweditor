import * as React from 'react';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';

export abstract class Renderer {
    
    props: Interfaces.NodeEditorProps;
    constructor(props: Interfaces.NodeEditorProps) {
        this.props = props;
    }

    public getClassName() {
        return this.props.type.split('_').join('-');
    }

    renderNode(): JSX.Element { return; }
    abstract renderForm(): JSX.Element;
    abstract submit(context: Interfaces.FlowContext, form: Element): void;
}

export class SendMessage extends Renderer {

    props: Interfaces.SendMessageProps;

    renderNode() {
        return <div>{this.props.text}</div>
    }
    
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

export class AddToGroup extends Renderer {

    props: Interfaces.AddToGroupProps;

    renderNode(): JSX.Element {
        throw new Error('Method not implemented.');
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {

    }
}

export class SaveToContact extends Renderer {

    props: Interfaces.SaveToContactProps;

    renderNode(): JSX.Element {
        throw new Error('Method not implemented.');
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }

}

export class SetLanguage extends Renderer {

    props: Interfaces.SetLanguageProps;

    renderNode(): JSX.Element {
        throw new Error('Method not implemented.');
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }
}

export class SwitchRouter extends Renderer {
    renderNode(): JSX.Element {
        throw new Error('Method not implemented.');
    }

    renderForm(): JSX.Element {
        return <div>Rule editor goes here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}

export class Webhook extends Renderer {
    renderNode(): JSX.Element {
        throw new Error('Method not implemented.');
    }

    renderForm(): JSX.Element {
        return <div>Webhook details go here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}