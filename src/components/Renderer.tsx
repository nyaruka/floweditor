import * as React from 'react';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';
var Select2 = require('react-select2-wrapper');

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
        context.flow.updateAction(this.props.uuid, {$set: {uuid: this.props.uuid, type: "msg", text: textarea.value}});
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
        return <div>Update <span className="emph">{this.props.name}</span></div>
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
    method: string;

    constructor(props: Interfaces.WebhookProps) {
        super(props);
        this.onChangeMethod = this.onChangeMethod.bind(this);
        this.method = this.props.method
        if (!this.method) {
            this.method = 'GET'
        }
    }

    onChangeMethod(evt: any) {
        this.method = evt.target.value;
    }

    renderNode(): JSX.Element {
        return <div className="url breaks">{this.props.url}</div>
    }

    renderForm(): JSX.Element {
        return (
            <div>
                <p>Using a Webhook you can trigger actions in external services or fetch data to use in this Flow. Enter a URL to call below.</p>
                <div>
                    <div style={{width: '15%', display: 'inline-block'}}>
                    <Select2
                        className="method"
                        style={{width: 'auto'}}
                        value={this.props.method}
                        onChange={this.onChangeMethod}
                        options={{ minimumResultsForSearch: -1 }}
                        data={[{id: 'GET', text: 'GET'}, {id: 'POST', text: 'POST'}]}
                    />
                    </div>
                    <div style={{width: '85%', display: 'inline-block', textAlign: 'right'}}>
                        <input name="url" className="url" defaultValue={this.props.url}/>
                    </div>
                </div>
                <p>If your server responds with JSON, each property will be added to Flow.</p>
                <pre className="code">{
`{
    "product": "Solar Charging Kit",
    "stock_level": 32
}`
                }</pre>
                <div className="help-text" style={{textAlign: 'center', marginTop: '-6px'}}>In this example @webhook.json.product would be available in all future steps.</div>
            </div>
        )
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        var url: HTMLInputElement = $(form).find('input')[0] as HTMLInputElement;
        context.flow.updateAction(this.props.uuid, {$set: {uuid: this.props.uuid, type: "webhook", url: url.value, method: this.method}});
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