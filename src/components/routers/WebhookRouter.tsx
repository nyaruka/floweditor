import * as React from 'react';
import * as update from 'immutability-helper';
import * as FlipMove from 'react-flip-move';
import { v4 as generateUUID } from 'uuid';
import {
    CallWebhook,
    Case,
    Exit,
    Router,
    SwitchRouter,
    Node,
    AnyAction,
    Methods
} from '../../flowTypes';
import { Type } from '../../providers/ConfigProvider/typeConfigs';
import { SwitchRouterState } from './SwitchRouter';
import { FormProps } from '../NodeEditor';
import SelectElement from '../form/SelectElement';
import HeaderElement, { Header } from '../form/HeaderElement';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import FormElement from '../form/FormElement';
import ComponentMap from '../../services/ComponentMap';

import * as styles from './Webhook.scss';

export interface WebhookRouterFormProps extends FormProps {
    config: Type;
    node: Node;
    showAdvanced: boolean;
    action: AnyAction;
    removeWidget(name: string): void;
    translating: boolean;
    triggerFormUpdate(): void;
    ComponentMap: ComponentMap;
    getExitTranslations(): JSX.Element;
    onToggleAdvanced(): void;
    saveLocalizedExits(widgets: { [name: string]: React.Component }): void;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
}

interface WebhookState extends SwitchRouterState {
    headers: Header[];
    method: Methods;
}

interface Method {
    value: Methods;
    label: Methods;
}

type MethodOptions = Method[];

const defaultBody: string = `{
    "contact": @(to_json(contact.uuid)),
    "contact_urn": @(to_json(contact.urns)),
    "message": @(to_json(input.text)),
    "flow": @(to_json(run.flow.uuid)),
    "flow_name": @(to_json(run.flow.name))
}`;

export default class WebhookForm extends React.Component<WebhookRouterFormProps, WebhookState> {
    private methodOptions: MethodOptions = [
        { value: Methods.GET, label: Methods.GET },
        { value: Methods.POST, label: Methods.POST },
        { value: Methods.PUT, label: Methods.PUT }
    ];

    constructor(props: WebhookRouterFormProps) {
        super(props);

        this.state = {
            resultName: null,
            setResultName: false,
            cases: [],
            operand: '@webhook',
            ...this.getRequestAttrs()
        };

        this.onValid = this.onValid.bind(this);
        this.onUpdateForm = this.onUpdateForm.bind(this);
        this.onMethodChanged = this.onMethodChanged.bind(this);
    }

    public onValid(widgets: { [name: string]: React.Component }): void {
        if (this.props.translating) {
            return this.props.saveLocalizedExits(widgets);
        }

        const urlEle = widgets.URL as TextInputElement;

        // Determine method
        let method: Methods = Methods.GET;
        const methodEle = widgets.Method as SelectElement;
        if (methodEle.state.value) {
            method = methodEle.state.value;
        }

        // Determine body
        let body = null;
        if (method === Methods.POST) {
            const bodyEle = widgets.Body as TextInputElement;
            body = bodyEle.state.value;
        }

        // Go through any headers we have
        const headers: { [name: string]: string } = {};
        let header: HeaderElement = null;

        Object.keys(widgets).forEach(key => {
            if (key.startsWith('header_')) {
                header = widgets[key] as HeaderElement;

                const name = header.state.name.trim();

                if (name.length > 0) {
                    headers[name] = header.state.value.trim();
                }
            }
        });

        const uuid = this.props.action.uuid || generateUUID();

        const newAction: CallWebhook = {
            uuid,
            type: this.props.config.type,
            url: urlEle.state.value,
            headers,
            method,
            body
        };

        const exits: Exit[] = [];
        const cases: Case[] = [];
        const details = this.props.ComponentMap.getDetails(this.props.node.uuid);

        // If we were already a webhook, lean on those exits and cases
        if (details && details.type === 'webhook') {
            this.props.node.exits.forEach(exit => exits.push(exit));

            (this.props.node.router as SwitchRouter).cases.forEach(kase => cases.push(kase));
        } else {
            // Otherwise, let's create some new ones
            exits.push(
                {
                    uuid: generateUUID(),
                    name: 'Success',
                    destination_node_uuid: null
                },
                {
                    uuid: generateUUID(),
                    name: 'Failure',
                    destination_node_uuid: null
                }
            );

            cases.push({
                uuid: generateUUID(),
                type: 'has_webhook_status',
                arguments: ['S'],
                exit_uuid: exits[0].uuid
            });
        }

        const router: SwitchRouter = {
            type: 'switch',
            operand: '@webhook',
            cases,
            default_exit_uuid: exits[1].uuid
        };

        // HACK: this should go away with modal <refactor></refactor>
        const nodeUUID: string =
            this.props.action && this.props.action.uuid === this.props.node.uuid
                ? generateUUID()
                : this.props.node.uuid;

        this.props.updateRouter(
            {
                uuid: nodeUUID,
                router,
                exits,
                actions: [newAction]
            },
            'webhook',
            this.props.action
        );
    }

    public onUpdateForm(widgets: { [name: string]: React.Component }): void {
        if (this.props.showAdvanced) {
            const methodEle = widgets.Method as SelectElement;
            const { state: { value: method } } = methodEle;

            if (method === Methods.GET) {
                this.props.removeWidget('Body');
            }

            this.setState({
                method
            });
        }
    }

    private onHeaderRemoved = (header: HeaderElement): void => {
        const newHeaders = this.addEmptyHeader(
            update(this.state.headers, { $splice: [[header.props.index, 1]] })
        );

        this.setState({ headers: newHeaders });
        this.props.removeWidget(header.props.name);
    };

    private onHeaderChanged = (ele: HeaderElement): void => {
        const { state: { name, value }, props: { header: { uuid } } } = ele;

        const headers = this.addEmptyHeader(
            update(this.state.headers, {
                [ele.props.index]: {
                    $set: {
                        name,
                        value,
                        uuid
                    } as Header
                }
            })
        );

        this.setState({ headers });
    };

    private onMethodChanged(method: Method): void {
        this.setState({ method: method.value as Methods }, () => this.props.triggerFormUpdate());
    }

    private getRequestAttrs(): { headers: Header[]; method: Methods } {
        let headers: Header[] = [];
        let method: Methods = Methods.PUT;

        if (this.props.action) {
            if (this.props.action.type === 'call_webhook') {
                const webhookAction = this.props.action as CallWebhook;

                ({ method } = webhookAction);

                if (webhookAction.headers) {
                    headers = this.addEmptyHeader(
                        Object.keys(webhookAction.headers).map(key => ({
                            name: key,
                            value: webhookAction.headers[key],
                            uuid: generateUUID()
                        }))
                    );
                }
            }
        }

        return { headers, method };
    }

    private addEmptyHeader(headers: Header[]): Header[] {
        const newHeaders = headers;
        let hasEmpty: boolean = false;

        for (const header of newHeaders) {
            if (header.name.trim().length === 0 && header.value.trim().length === 0) {
                hasEmpty = true;
                break;
            }
        }

        if (!hasEmpty) {
            newHeaders.push({ name: '', value: '', uuid: generateUUID() });
        }

        return newHeaders;
    }

    private getFormAttrs(): { method: Methods; url: string } {
        let method = Methods.GET;
        let url = '';

        if (this.props.action) {
            if (this.props.action.type === 'call_webhook') {
                ({ method, url } = this.props.action as CallWebhook);
            }
        }

        return {
            method,
            url
        };
    }

    private getSummary(): JSX.Element {
        const baseText: string = 'configure the headers';
        const linkText: string =
            this.state.method === Methods.GET ? baseText : `${baseText} and body`;

        return (
            <span>
                If you need to, you can also{' '}
                <a href="#" onClick={this.props.onToggleAdvanced}>
                    {linkText}
                </a>{' '}
                for your request.
            </span>
        );
    }

    private getBody(): string {
        let postBody: string = defaultBody;

        if (this.props.action) {
            if (this.props.action.type === 'call_webhook') {
                if ((this.props.action as CallWebhook).body) {
                    ({ body: postBody } = this.props.action as CallWebhook);
                }
            }
        }

        return postBody;
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        const { method, url }: { method: Methods; url: string } = this.getFormAttrs();

        const summary: JSX.Element = this.getSummary();

        return (
            <div>
                <p>
                    Use this step to trigger actions in external services or fetch data to use in
                    this Flow. Enter a URL to call below.
                </p>
                <div className={styles.method}>
                    <SelectElement
                        ref={this.props.onBindWidget}
                        name="Method"
                        defaultValue={method}
                        onChange={this.onMethodChanged}
                        options={this.methodOptions}
                    />
                </div>
                <div className={styles.url}>
                    <TextInputElement
                        ref={this.props.onBindWidget}
                        name="URL"
                        placeholder="Enter a URL"
                        value={url}
                        autocomplete={true}
                        required={true}
                        url={true}
                        ComponentMap={this.props.ComponentMap}
                    />
                </div>
                <div className={styles.instructions}>
                    <p>
                        {summary} If your server responds with JSON, each property will be added to
                        the Flow.
                    </p>
                    <pre className={styles.code}>
                        {'{ "product": "Solar Charging Kit", "stock level": 32 }'}
                    </pre>
                    <p>
                        In this example{' '}
                        <span className={styles.example}>@webhook.json.product</span> and{' '}
                        <span className={styles.example}>@webhook.json["stock level"]</span> would
                        be available in all future steps.
                    </p>
                </div>
            </div>
        );
    }

    private renderAdvanced(): JSX.Element {
        if (this.props.translating) {
            return null;
        }

        const body: string = this.getBody();

        const headerElements: JSX.Element[] = this.state.headers.map(
            (header: Header, index: number) => (
                <div key={header.uuid}>
                    <HeaderElement
                        ref={this.props.onBindAdvancedWidget}
                        name={`header_${index}`}
                        header={header}
                        onRemove={this.onHeaderRemoved}
                        onChange={this.onHeaderChanged}
                        index={index}
                        ComponentMap={this.props.ComponentMap}
                    />
                </div>
            )
        );

        const bodyForm: JSX.Element =
            this.state.method === Methods.POST ? (
                <div className={styles.bodyForm}>
                    <h4>POST Body</h4>
                    <p>Modify the body that is sent as part of your POST.</p>
                    <TextInputElement
                        __className={styles.body}
                        ref={this.props.onBindAdvancedWidget}
                        name="Body"
                        showLabel={false}
                        value={body}
                        helpText="Modify the body of the POST request sent to your webhook."
                        autocomplete={true}
                        textarea={true}
                        required={true}
                        ComponentMap={this.props.ComponentMap}
                    />
                </div>
            ) : null;

        return (
            <div>
                <h4 className={styles.headers_title}>Headers</h4>
                <p className={styles.info}>
                    Add any additional headers below that you would like to send along with your
                    request.
                </p>
                <FlipMove
                    easing="ease-out"
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                    duration={300}>
                    {headerElements}
                </FlipMove>
                {bodyForm}
            </div>
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced ? this.renderAdvanced() : this.renderForm();
    }
}
