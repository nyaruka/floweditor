import * as React from 'react';
import * as UUID from 'uuid';
import * as update from 'immutability-helper';

import { NodeForm } from "../NodeForm";
import { SwitchRouterProps, SwitchRouterState, SwitchRouterForm } from "./SwitchRouter";
import { SelectElement } from '../form/SelectElement';
import { Webhook, Case, Exit, SwitchRouter } from '../../FlowDefinition';
import { NodeModalProps } from "../NodeModal";
import { TextInputElement, HTMLTextElement } from '../form/TextInputElement';

import { FormElement, FormElementProps } from '../form/FormElement';
import { FormWidget, FormValueState } from '../form/FormWidget';

var forms = require('../form/FormElement.scss');
var styles = require('./Webhook.scss');

var defaultBody: string = `{
    "contact": @(to_json(contact.uuid)),
    "contact_urn": @(to_json(contact.urns)),
    "message": @(to_json(input.text)),
    "flow": @(to_json(run.flow_uuid))
}`;

export interface Header {
    uuid: string;
    name: string;
    value: string;
}

interface WebhookProps extends SwitchRouterProps {

}

interface WebhookState extends SwitchRouterState {
    headers: Header[];
    method: string;
}

export class WebhookForm extends SwitchRouterForm<WebhookProps, WebhookState> {
    private methodOptions = [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }];
    constructor(props: WebhookProps) {
        super(props);
        this.onHeaderRemoved = this.onHeaderRemoved.bind(this);
        this.onHeaderChanged = this.onHeaderChanged.bind(this);
        this.onMethodChanged = this.onMethodChanged.bind(this);

        var headers: Header[] = [];
        var method = "GET";

        if (this.props.action) {
            var action = this.props.action;
            if (action.type == "call_webhook") {
                var webhookAction: Webhook = action as Webhook;
                if (webhookAction.headers) {
                    for (let key in webhookAction.headers) {
                        headers.push({
                            name: key,
                            value: webhookAction.headers[key],
                            uuid: UUID.v4()
                        });
                    }
                }
                method = webhookAction.method;
            }
        }

        this.addEmptyHeader(headers);

        this.state = {
            resultName: null,
            setResultName: false,
            cases: [],
            headers: headers,
            method: method
        };
    }

    addEmptyHeader(headers: Header[]) {
        var hasEmpty = false;
        for (let header of headers) {
            if (header.name.trim().length == 0 && header.value.trim().length == 0) {
                hasEmpty = true;
                break;
            }
        }

        if (!hasEmpty) {
            headers.push({ name: "", value: "", uuid: UUID.v4() });
        }
    }

    onHeaderRemoved(header: HeaderElement) {
        var newHeaders = update(this.state.headers, { $splice: [[header.props.index, 1]] });
        this.addEmptyHeader(newHeaders);
        this.setState({ headers: newHeaders });
    }

    onHeaderChanged(ele: HeaderElement) {

        const { name, value } = ele.state;
        var newHeaders = update(this.state.headers, {
            [ele.props.index]: {
                $set: {
                    name: name,
                    value: value,
                    uuid: ele.props.header.uuid
                } as Header
            }
        });

        this.addEmptyHeader(newHeaders);
        this.setState({ headers: newHeaders });
    }

    onMethodChanged(method: { value: string, label: string }) {
        this.setState({ method: method.value });
    }

    renderForm(): JSX.Element {

        var method = "GET";
        var url = "";


        var postBody = defaultBody;

        var nodeUUID = this.props.uuid;

        if (this.props.action) {
            var action = this.props.action;
            if (action.type == "call_webhook") {
                var webhookAction: Webhook = action as Webhook;
                method = webhookAction.method
                url = webhookAction.url;

                if (webhookAction.body) {
                    postBody = webhookAction.body;
                }
            }
        }

        var ref = this.ref.bind(this);
        var headerElements: JSX.Element[] = [];
        this.state.headers.map((header: Header, index: number) => {
            headerElements.push(<HeaderElement
                key={header.uuid}
                ref={ref}
                name={header.name}
                header={header}
                onRemove={this.onHeaderRemoved}
                onChange={this.onHeaderChanged}
                index={index}
            />);
        });

        var summary = null;
        if (this.state.method == "POST") {
            summary = (
                <div>
                    <TextInputElement className={styles.post_body} ref={ref} name="Body" showLabel={false} defaultValue={postBody} helpText="Modify the body of the POST sent to your webhook." autocomplete textarea required />
                    <p>If your server responds with JSON, each property will be added to the Flow. They can be accessed using <span className={styles.example}>@webhook.json.my_response_value</span></p>
                </div>
            )
        } else {
            summary = (
                <div className={styles.instructions}>
                    <p>If your server responds with JSON, each property will be added to the Flow.</p>
                    <pre className={styles.code}>{
                        `{ "product": "Solar Charging Kit", "stock level": 32 }`
                    }</pre>
                    <p>In this example <span className={styles.example}>@webhook.json.product</span> and <span className={styles.example}>@webhook.json["stock level"]</span> would be available in all future steps.</p>
                </div>
            )
        }

        return (
            <div>
                <p>Using a Webhook you can trigger actions in external services or fetch data to use in this Flow. Enter a URL to call below.</p>

                <div className={styles.method}>
                    <SelectElement ref={ref} name="Method" defaultValue={method} onChange={this.onMethodChanged} options={this.methodOptions} />
                </div>
                <div className={styles.url}>
                    <TextInputElement ref={ref} name="URL" placeholder="Enter a URL" defaultValue={url} autocomplete required url />
                </div>

                <div>
                    {headerElements}
                </div>

                {summary}

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

        var eles = this.getElements();

        var methodEle = eles[0] as SelectElement;
        var urlEle = eles[1] as TextInputElement;
        var Ele = eles[1] as TextInputElement;

        var method = "GET";
        var body = null;

        if (methodEle.state.value) {
            method = methodEle.state.value;
        }

        if (method == "POST") {
            var bodyEle = eles[eles.length - 1] as TextInputElement;
            body = bodyEle.state.value
        }

        // go through any headers we have
        var headers: { [name: string]: string } = {}

        this.state.headers.map((header: Header, index: number) => {
            const { name, value, uuid } = header;
            if (name.trim().length > 0) {
                headers[name] = value;
            }
        });

        var newAction: Webhook = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            url: urlEle.state.value,
            headers: headers,
            method: method,
            body: body
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

        // HACK: this should go away with modal <refactor></refactor>
        var nodeUUID = this.props.uuid;
        if (this.props.action && this.props.action.uuid == nodeUUID) {
            nodeUUID = UUID.v4();
        }

        modal.onUpdateRouter({
            uuid: nodeUUID,
            router: router,
            exits: exits,
            actions: [newAction]
        }, "webhook");
    }
}

export interface HeaderElementProps {
    name: string; // satisfy form widget

    header: Header;
    index: number;
    onRemove(header: HeaderElement): void;
    onChange(header: HeaderElement): void;
}

interface HeaderElementState extends FormValueState {
    name: string;
    value: string;
}

export class HeaderElement extends FormWidget<HeaderElementProps, HeaderElementState> {

    private category: TextInputElement;

    constructor(props: HeaderElementProps) {
        super(props);

        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeValue = this.onChangeValue.bind(this);

        this.state = {
            errors: [],
            name: this.props.header.name,
            value: this.props.header.value
        }
    }

    private onChangeName(event: React.SyntheticEvent<HTMLTextElement>) {
        this.setState({
            name: event.currentTarget.value
        }, () => {
            this.props.onChange(this);
        });
    }

    private onChangeValue(event: React.SyntheticEvent<HTMLTextElement>) {
        this.setState({
            value: event.currentTarget.value
        }, () => {
            this.props.onChange(this);
        });
    }

    private onRemove(ele: any) {
        this.props.onRemove(this);
    }

    validate(): boolean {
        var errors: string[] = [];

        if (this.state.value.trim().length > 0) {
            if (this.state.name.trim().length == 0) {
                errors.push("HTTP headers must have a name");
            }
        }
        this.setState({ errors: errors });
        return errors.length == 0;
    }

    render() {
        var classes = [styles.header];
        if (this.state.errors.length > 0) {
            classes.push(forms.invalid);
        }

        return (
            <FormElement name={this.props.name} errors={this.state.errors} className={styles.group}>
                <div className={styles.header}>
                    <div className={styles.header_name}>
                        <TextInputElement placeholder="Header Name" name="name" onChange={this.onChangeName} defaultValue={this.state.name} />
                    </div>
                    <div className={styles.header_value}>
                        <TextInputElement placeholder="Value" name="value" onChange={this.onChangeValue} defaultValue={this.state.value} autocomplete />
                    </div>
                    <div className={styles.remove_button} onMouseUp={this.onRemove.bind(this)}><span className="icon-remove" /></div>
                </div>
            </FormElement>
        )
    }
}