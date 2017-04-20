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
        if (this.props.text) {
            return <div>{this.props.text}</div>
        } else {
            return <div className='placeholder'>Send a message to the contact</div>
        }
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
        context.flow.updateAction(this.props.uuid, {$set: {uuid: this.props.uuid, type: this.props.type, text: textarea.value}});
    }
}

export class AddToGroup extends Renderer {

    props: Interfaces.AddToGroupProps;

    renderNode(): JSX.Element {
        return <div>{this.props.name}</div>
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
        return <div>Update value for <span className="emph">{this.props.name}</span></div>
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
        return <div>Not implemented</div>
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }
}

export class Webhook extends Renderer {
    props: Interfaces.WebhookProps;

    renderNode(): JSX.Element {
        return <div className="url breaks">{this.props.url}</div>
    }

    renderForm(): JSX.Element {
        return <div>Webhook details go here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}

export class SwitchRouter extends Renderer {
    renderNode(): JSX.Element {
        return <div>Not implemented</div>
    }

    renderForm(): JSX.Element {
        return <div>Rule editor goes here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}

export class RandomRouter extends Renderer {
    renderNode(): JSX.Element {
        return <div>Not implemented</div>
    }

    renderForm(): JSX.Element {
        return <div>Random split editor goes here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}