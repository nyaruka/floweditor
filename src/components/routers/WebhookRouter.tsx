import * as React from 'react';
import * as update from 'immutability-helper';
import * as FlipMove from 'react-flip-move';
import { v4 as generateUUID } from 'uuid';
import { CallWebhook, Case, Exit, Router, SwitchRouter, Node, AnyAction } from '../../flowTypes';
import { Type } from '../../providers/ConfigProvider/typeConfigs';
import { SwitchRouterState } from './SwitchRouter';
import { FormProps } from '../NodeEditor';
import SelectElement from '../form/SelectElement';
import HeaderElement, { Header } from '../form/HeaderElement';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import FormElement from '../form/FormElement';
import ComponentMap from '../../services/ComponentMap';

const styles = require('./Webhook.scss');

const defaultBody: string = `{
    "contact": @(to_json(contact.uuid)),
    "contact_urn": @(to_json(contact.urns)),
    "message": @(to_json(input.text)),
    "flow": @(to_json(run.flow.uuid)),
    "flow_name": @(to_json(run.flow.name))
}`;

export interface WebhookRouterFormProps extends FormProps {
    config: Type;
    node: Node;
    showAdvanced: boolean;
    action: AnyAction;
    getActionUUID(): string;
    removeWidget(name: string): void;
    translating: boolean;
    triggerFormUpdate(): void;
    ComponentMap: ComponentMap;
    renderExitTranslations(): JSX.Element;
    onToggleAdvanced(): void;
    saveLocalizedExits(widgets: { [name: string]: React.Component }): void;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
}

interface WebhookState extends SwitchRouterState {
    headers: Header[];
    method: string;
}

export default class WebhookForm extends React.Component<WebhookRouterFormProps, WebhookState> {
    private methodOptions: { value: string; label: string }[];

    constructor(props: WebhookRouterFormProps) {
        super(props);

        let headers: Header[] = [];
        let method: string = 'GET';

        if (this.props.action) {
            const { action } = this.props;
            if (action.type === 'call_webhook') {
                const webhookAction: CallWebhook = action as CallWebhook;

                if (webhookAction.headers) {
                    for (let key in webhookAction.headers) {
                        headers = [
                            ...headers,
                            {
                                name: key,
                                value: webhookAction.headers[key],
                                uuid: generateUUID()
                            }
                        ];
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
            headers,
            method,
            operand: '@webhook'
        };

        this.methodOptions = [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }];

        this.onValid = this.onValid.bind(this);
        this.onUpdateForm = this.onUpdateForm.bind(this);
        this.onHeaderRemoved = this.onHeaderRemoved.bind(this);
        this.onHeaderChanged = this.onHeaderChanged.bind(this);
        this.onMethodChanged = this.onMethodChanged.bind(this);
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
            headers.push({ name: '', value: '', uuid: generateUUID() });
        }
    }

    onHeaderRemoved(header: HeaderElement) {
        const newHeaders = update(this.state.headers, { $splice: [[header.props.index, 1]] });
        this.addEmptyHeader(newHeaders);
        this.setState({ headers: newHeaders });
        this.props.removeWidget(header.props.name);
    }

    onHeaderChanged(ele: HeaderElement) {
        const { name, value } = ele.state;

        const newHeaders = update(this.state.headers, {
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

    onMethodChanged(method: { value: string; label: string }) {
        this.setState({ method: method.value });
        this.props.triggerFormUpdate();
    }

    public onUpdateForm(widgets: { [name: string]: React.Component }): void {
        if (this.props.showAdvanced) {
            var methodEle = widgets['Method'] as SelectElement;
            if (methodEle.state.value == 'GET') {
                this.props.removeWidget('Body');
            }

            this.setState({
                method: methodEle.state.value
            });
        }
    }

    private renderAdvanced(): JSX.Element {
        if (this.props.translating) {
            return null;
        }

        var postBody = defaultBody;
        if (this.props.action) {
            var action = this.props.action;
            if (action.type == 'call_webhook') {
                var webhookAction: CallWebhook = action as CallWebhook;
                if (webhookAction.body) {
                    postBody = webhookAction.body;
                }
            }
        }

        var headerElements: JSX.Element[] = [];
        this.state.headers.map((header: Header, index: number) => {
            headerElements.push(
                <div key={header.uuid}>
                    <HeaderElement
                        ref={this.props.onBindAdvancedWidget}
                        name={'header_' + index}
                        header={header}
                        onRemove={this.onHeaderRemoved}
                        onChange={this.onHeaderChanged}
                        index={index}
                        ComponentMap={this.props.ComponentMap}
                    />
                </div>
            );
        });

        var postForm = null;

        if (this.state.method == 'POST') {
            postForm = (
                <div className={styles.post_body_form}>
                    <h4>POST Body</h4>
                    <p>Modify the body that is sent as part of your POST.</p>
                    <TextInputElement
                        className={styles.post_body}
                        ref={this.props.onBindAdvancedWidget}
                        name="Body"
                        showLabel={false}
                        value={postBody}
                        helpText="Modify the body of the POST sent to your webhook."
                        autocomplete
                        textarea
                        required
                        ComponentMap={this.props.ComponentMap}
                    />
                </div>
            );
        }
        return (
            <div>
                <h4 className={styles.headers_title}>Headers</h4>
                <p>
                    Add any additional headers belows that you would like to send along with your
                    request.
                </p>
                <FlipMove
                    easing="ease-out"
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                    className={styles.headers}
                    duration={300}>
                    {headerElements}
                </FlipMove>
                {postForm}
            </div>
        );
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.renderExitTranslations();
        }

        var method = 'GET';
        var url = '';

        var nodeUUID = this.props.node.uuid;

        if (this.props.action) {
            var action = this.props.action;
            if (action.type == 'call_webhook') {
                var webhookAction: CallWebhook = action as CallWebhook;
                method = webhookAction.method;
                url = webhookAction.url;
            }
        }

        var summary = null;
        if (this.state.method == 'GET') {
            summary = (
                <span>
                    If you need to, you can also{' '}
                    <a href="#" onClick={this.props.onToggleAdvanced}>
                        modify the headers
                    </a>{' '}
                    for your request.{' '}
                </span>
            );
        } else {
            summary = (
                <span>
                    If you need to, you can also{' '}
                    <a href="#" onClick={this.props.onToggleAdvanced}>
                        modify the headers and body
                    </a>{' '}
                    for your request.{' '}
                </span>
            );
        }

        return (
            <div>
                <p>
                    Using a CallWebhook you can trigger actions in external services or fetch data
                    to use in this Flow. Enter a URL to call below.
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
                        autocomplete
                        required
                        url
                        ComponentMap={this.props.ComponentMap}
                    />
                </div>

                <div className={styles.instructions}>
                    <p>
                        {summary}If your server responds with JSON, each property will be added to
                        the Flow.
                    </p>
                    <pre
                        className={
                            styles.code
                        }>{`{ "product": "Solar Charging Kit", "stock level": 32 }`}</pre>
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

    public onValid(widgets: { [name: string]: React.Component }): void {
        if (this.props.translating) {
            return this.props.saveLocalizedExits(widgets);
        }

        var method = 'GET';
        var body = null;

        var methodEle = widgets['Method'] as SelectElement;
        var urlEle = widgets['URL'] as TextInputElement;

        if (methodEle.state.value) {
            method = methodEle.state.value;
        }

        if (method == 'POST') {
            var bodyEle = widgets['Body'] as TextInputElement;
            body = bodyEle.state.value;
        }

        /** Go through any headers we have */
        var headers: { [name: string]: string } = {};
        var header: HeaderElement = null;
        for (let key of Object.keys(widgets)) {
            if (key.startsWith('header_')) {
                header = widgets[key] as HeaderElement;
                var name = header.state.name.trim();
                var value = header.state.value.trim();
                if (name.length > 0) {
                    headers[name] = value;
                }
            }
        }

        var newAction: CallWebhook = {
            uuid: this.props.getActionUUID(),
            type: this.props.config.type,
            url: urlEle.state.value,
            headers: headers,
            method: method,
            body: body
        };

        // if we were already a webhook, lean on those exits and cases
        var exits = [];
        var cases: Case[];

        var details = this.props.ComponentMap.getDetails(this.props.node.uuid);
        if (details && details.type == 'webhook') {
            exits = this.props.node.exits;
            cases = (this.props.node.router as SwitchRouter).cases;
        } else {
            // otherwise, let's create some new ones
            exits = [
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
            ];

            cases = [
                {
                    uuid: generateUUID(),
                    type: 'has_webhook_status',
                    arguments: ['S'],
                    exit_uuid: exits[0].uuid
                }
            ];
        }

        var router: SwitchRouter = {
            type: 'switch',
            operand: '@webhook',
            cases: cases,
            default_exit_uuid: exits[1].uuid
        };

        // HACK: this should go away with modal <refactor></refactor>
        var nodeUUID = this.props.node.uuid;
        if (this.props.action && this.props.action.uuid == nodeUUID) {
            nodeUUID = generateUUID();
        }

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

    render(): JSX.Element {
        if (this.props.showAdvanced) {
            return this.renderAdvanced();
        }
        return this.renderForm();
    }
}
