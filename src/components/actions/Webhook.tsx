import * as React from 'react';
import { ActionComp } from '../Action';
import { NodeForm } from '../NodeForm';
import { WebhookProps, NodeEditorState } from '../../interfaces';
import { NodeModalProps } from '../NodeModal';
import { SelectElement } from '../form/SelectElement';
import { InputElement } from '../form/InputElement';

var styles = require('./Webhook.scss');
var shared = require('../shared.scss');

export interface WebhookState {
    method: string;
}

export class Webhook extends ActionComp<WebhookProps> {
    renderNode(): JSX.Element {
        return <div>{this.props.url}</div>
    }
}

export class WebhookForm extends NodeForm<WebhookProps, WebhookState> {

    private methodOptions = [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }];

    constructor(props: WebhookProps) {
        super(props);

        var method = props.method;
        if (!method) {
            method = "GET";
        }

        this.state = {
            method: method
        }
    }

    onChangeMethod(value: any) {
        this.setState({ method: value.value });
    }

    renderForm(): JSX.Element {

        var method = this.props.method;
        if (!method) {
            method = "GET";
        }

        var ref = this.ref.bind(this);

        return (
            <div>
                <p>Using a Webhook you can trigger actions in external services or fetch data to use in this Flow. Enter a URL to call below.</p>

                <div className={styles.method}>
                    <SelectElement ref={ref} name="Method" value={method} options={this.methodOptions} />
                </div>
                <div className={styles.url}>
                    <InputElement ref={ref} name="URL" placeholder="Enter a URL" value={this.props.url} required url />
                </div>

                <div className={styles.instructions}>
                    <p>If your server responds with JSON, each property will be added to Flow.</p>
                    <pre className={styles.code}>{
                        `{ "product": "Solar Charging Kit", "stock_level": 32 }`
                    }</pre>
                    <div>In this example @webhook.json.product would be available in all future steps.</div>
                </div>
            </div>
        )
    }

    submit(modal: NodeModalProps) {

        var methodEle = this.getElements()[0] as SelectElement;
        var urlEle = this.getElements()[1] as InputElement;

        modal.onUpdateAction({
            uuid: this.props.uuid,
            type: "webhook",
            url: urlEle.state.value,
            method: methodEle.state.value
        } as WebhookProps);
    }
}