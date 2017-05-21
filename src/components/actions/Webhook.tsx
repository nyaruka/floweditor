import * as React from 'react';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {WebhookProps, NodeEditorState} from '../../interfaces';
import {NodeModalProps} from '../NodeModal';

var Select2 = require('react-select2-wrapper');


export class Webhook extends Action<WebhookProps> {
    renderNode(): JSX.Element {
        return <div className="url breaks">{this.props.url}</div>
    }
}

export class WebhookForm extends NodeForm<WebhookProps, NodeEditorState> {

    private method: string

    onChangeMethod(evt: any) {
        this.method = evt.target.value;
    }

    renderForm(): JSX.Element {
        return (
            <div>
                <p>Using a Webhook you can trigger actions in external services or fetch data to use in this Flow. Enter a URL to call below.</p>
                <div>
                    <div className="form-group" style={{verticalAlign:'top', width: '15%', display: 'inline-block'}}>
                        <Select2
                            name="method"
                            className="method form-control"
                            style={{width: 'auto'}}
                            value={this.props.method}
                            onChange={this.onChangeMethod.bind(this)}
                            options={{ minimumResultsForSearch: -1 }}
                            data={[{id: 'GET', text: 'GET'}, {id: 'POST', text: 'POST'}]}
                        />
                    </div>
                    <div style={{display:'inline-block', width:'2%'}}/>
                    <div className="form-group" style={{width: '83%', verticalAlign:"top", display: 'inline-block'}}>
                        <input name="url" className="url form-control" defaultValue={this.props.url}/>
                        <div className="error"></div>
                    </div>
                </div>
                <div className="form-group">
                    <p>If your server responds with JSON, each property will be added to Flow.</p>
                    <pre className="code">{
                        `{ "product": "Solar Charging Kit", "stock_level": 32 }`
                    }</pre>
                    <div className="form-help" style={{textAlign: 'center', marginTop: '-6px'}}>In this example @webhook.json.product would be available in all future steps.</div>
                </div>
            </div>
        )
    }

    private isValidURL(string: string) {
        var pattern = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/; // fragment locater
        if(!pattern.test(string)) {
            return false;
        } else {
            return true;
        }
    }

    validate(control: any): string {
        if (control.name == "url") {
            var input = control as HTMLInputElement;
            if (!this.isValidURL(input.value)) {
                return "A valid URL is required";
            }
        }
        return null;
    }
    
    submit(form: Element, modal: NodeModalProps) {
        var url: HTMLInputElement = $(form).find('input')[0] as HTMLInputElement;
        modal.onUpdateAction({
            uuid: this.props.uuid, 
            type: "webhook", 
            url: url.value, 
            method: this.method
        } as WebhookProps);
    }
}