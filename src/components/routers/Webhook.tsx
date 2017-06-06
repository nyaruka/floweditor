import * as React from 'react';
import * as UUID from 'uuid';
import { NodeForm } from "../NodeForm";
import { SwitchRouterProps, SwitchRouterState, SwitchRouterForm } from "./SwitchRouter";
import { SelectElement } from '../form/SelectElement';
import { Webhook, Case, Exit, SwitchRouter } from '../../FlowDefinition';
import { NodeModalProps } from "../NodeModal";
import { TextInputElement } from '../form/TextInputElement';
var styles = require('./Webhook.scss');

interface WebhookProps extends SwitchRouterProps {

}

interface WebhookState extends SwitchRouterState {

}

export class WebhookForm extends SwitchRouterForm<WebhookProps> {
    private methodOptions = [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }];

    renderForm(): JSX.Element {

        var method = "GET";
        var url = "";

        if (this.props.action) {
            var action = this.props.action;
            if (action.type == "call_webhook") {
                var webhookAction: Webhook = action as Webhook;
                method = webhookAction.method
                url = webhookAction.url;
            }
        }

        var ref = this.ref.bind(this);

        return (
            <div>
                <p>Using a Webhook you can trigger actions in external services or fetch data to use in this Flow. Enter a URL to call below.</p>

                <div className={styles.method}>
                    <SelectElement ref={ref} name="Method" defaultValue={method} options={this.methodOptions} />
                </div>
                <div className={styles.url}>
                    <TextInputElement ref={ref} name="URL" placeholder="Enter a URL" defaultValue={url} autocomplete required url />
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

    getUUID(): string {
        if (this.props.action) {
            return this.props.action.uuid;
        }
        return UUID.v4();
    }

    submit(modal: NodeModalProps): void {

        var methodEle = this.getElements()[0] as SelectElement;
        var urlEle = this.getElements()[1] as TextInputElement;

        var newAction: Webhook = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            url: urlEle.state.value,
            method: methodEle.state.value.value
        }

        // if we were already a subflow, lean on those exits
        var exits = [];
        if (this.props.type == "webhook") {
            exits = this.props.exits;
        } else {
            exits = [
                {
                    uuid: UUID.v4(),
                    name: "Success",
                    destination_node_uuid: null
                },
                {
                    uuid: UUID.v4(),
                    name: "Failure",
                    destination_node_uuid: null
                }
            ]
        }

        var cases: Case[] = [
            {
                uuid: UUID.v4(),
                type: "has_webhook_status",
                arguments: ["S"],
                exit_uuid: exits[0].uuid
            }
        ]

        var router: SwitchRouter = {
            type: "switch",
            operand: "@webhook",
            cases: cases,
            default_exit_uuid: exits[1].uuid
        }

        modal.onUpdateRouter({
            uuid: this.props.uuid,
            router: router,
            exits: exits,
            actions: [newAction]
        }, "webhook");
    }
}
