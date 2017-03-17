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

export class AddToGroupForm extends ActionForm {

    props: Interfaces.AddToGroupProps;

    renderTitle(): JSX.Element {
        return <span>Add to Group</span>
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {

    }
}

export class SaveToContactForm extends ActionForm {

    props: Interfaces.SaveToContactProps;

    renderTitle(): JSX.Element {
        return <span>Save to Contact</span>
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }

}

export class SetLanguageForm extends ActionForm {

    props: Interfaces.SetLanguageProps;

    renderTitle(): JSX.Element {
        return <span>Set language</span>
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }
}