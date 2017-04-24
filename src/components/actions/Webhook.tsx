import * as React from 'react';
import {Renderer} from '../Renderer'
import * as Interfaces from '../../interfaces';
var Select2 = require('react-select2-wrapper');

export class Webhook extends Renderer {
    props: Interfaces.WebhookProps;
    method: string;

    constructor(props: Interfaces.WebhookProps, context: Interfaces.FlowContext) {
        super(props, context);
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
                    `{ "product": "Solar Charging Kit", "stock_level": 32 }`
                }</pre>
                <div className="form-help" style={{textAlign: 'center', marginTop: '-6px'}}>In this example @webhook.json.product would be available in all future steps.</div>
            </div>
        )
    }
    
    submit(form: Element): void {
        var url: HTMLInputElement = $(form).find('input')[0] as HTMLInputElement;
        this.context.flow.updateAction(this.props.uuid, {$set: {uuid: this.props.uuid, type: "webhook", url: url.value, method: this.method}});
    }
}

export default Webhook;