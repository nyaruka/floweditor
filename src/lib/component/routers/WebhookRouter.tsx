import * as React from 'react';
import * as update from 'immutability-helper';
import * as FlipMove from 'react-flip-move';
import { substObj } from '@ycleptkellan/substantive';
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
import { Type } from '../../config';
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
    action: CallWebhook;
    removeWidget: (name: string) => void;
    translating: boolean;
    triggerFormUpdate: () => void;
    ComponentMap: ComponentMap;
    getExitTranslations(): JSX.Element;
    onToggleAdvanced: () => void;
    saveLocalizedExits: (widgets: { [name: string]: React.Component }) => void;
    updateRouter: (node: Node, type: string, previousAction: AnyAction) => void;
    onBindWidget: (ref: any) => void;
    onBindAdvancedWidget: (ref: any) => void;
}

interface WebhookState extends SwitchRouterState {
    headers: Header[];
    method: Methods;
}

interface MethodMap {
    value: Methods;
    label: Methods;
}

interface HeaderMap {
    [name: string]: string;
}

type MethodOptions = MethodMap[];

const DEFAULT_BODY: string = `{
    "contact": @(to_json(contact.uuid)),
    "contact_urn": @(to_json(contact.urns)),
    "message": @(to_json(input.text)),
    "flow": @(to_json(run.flow.uuid)),
    "flow_name": @(to_json(run.flow.name))
}`;

const WEBHOOK_LEGEND: string =
    'Use this step to trigger actions in external services or fetch data to use in this Flow. Enter a URL to call below.';

export default class WebhookForm extends React.Component<
    WebhookRouterFormProps,
    WebhookState
> {
    private methodOptions: MethodOptions = [
        { value: Methods.GET, label: Methods.GET },
        { value: Methods.POST, label: Methods.POST },
        { value: Methods.PUT, label: Methods.PUT }
    ];

    constructor(props: WebhookRouterFormProps) {
        super(props);

        this.state = this.getInitialState();

        this.onValid = this.onValid.bind(this);
        this.onUpdateForm = this.onUpdateForm.bind(this);
        this.onHeaderRemoved = this.onHeaderRemoved.bind(this);
        this.onHeaderChanged = this.onHeaderChanged.bind(this);
        this.onMethodChanged = this.onMethodChanged.bind(this);
    }

    public onValid(widgets: { [name: string]: React.Component }): void {
        if (this.props.translating) {
            return this.props.saveLocalizedExits(widgets);
        }

        const urlEle = widgets.URL as TextInputElement;

        // Determine method
        let method: Methods = Methods.GET;
        const methodEle = widgets.MethodMap as SelectElement;
        if (methodEle.state.value) {
            method = methodEle.state.value;
        }

        // Determine body
        let body: string = DEFAULT_BODY;
        if (method === Methods.POST || method === Methods.PUT) {
            const bodyEle = widgets.Body as TextInputElement;
            body = bodyEle.state.value;
        }

        // Go through any headers we have
        const headers: HeaderMap = Object.keys(widgets).reduce((map, key) => {
            if (key.startsWith('header_')) {
                const header: HeaderElement = widgets[key] as HeaderElement;
                const headerName: string = header.state.name.trim();
                const headerState: string = header.state.value.trim();

                // Note: we're overwriting headers with the same 'name' value
                if (headerName.length) {
                    map[headerName] = headerState;
                }
            }

            return map;
        }, {});

        const uuid: string =
            (this.props.action && this.props.action.uuid) || generateUUID();

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
        const details = this.props.ComponentMap.getDetails(
            this.props.node.uuid
        );

        // If we were already a webhook, lean on those exits and cases
        if (details && details.type === 'webhook') {
            this.props.node.exits.forEach(exit => exits.push(exit));
            (this.props.node.router as SwitchRouter).cases.forEach(kase =>
                cases.push(kase)
            );
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
            const methodEle = widgets.MethodMap as SelectElement;
            const { state: { value: method } } = methodEle;

            if (method === Methods.GET) {
                this.props.removeWidget('Body');
            }

            this.setState({
                method
            });
        }
    }

    private onHeaderRemoved(header: HeaderElement): void {
        const newHeaders = this.addEmptyHeader(
            update(this.state.headers, { $splice: [[header.props.index, 1]] })
        );

        this.setState({ headers: newHeaders }, () =>
            this.props.removeWidget(header.props.name)
        );
    }

    private onHeaderChanged(ele: HeaderElement): void {
        const { state: { name, value }, props: { header: { uuid } } } = ele;

        if (!name && !value) {
            this.onHeaderRemoved(ele);
        } else {
            const headers: Header[] = this.addEmptyHeader(
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
        }
    }

    private onMethodChanged(method: MethodMap): void {
        this.setState({ method: method.value as Methods }, () =>
            this.props.triggerFormUpdate()
        );
    }

    private getInitialState(): WebhookState {
        const initialState: WebhookState = {
            resultName: null,
            setResultName: false,
            cases: [],
            headers: [{ name: '', value: '', uuid: generateUUID() }],
            operand: '@webhook',
            method: Methods.GET
        };

        if (this.props.action && this.props.action.type === 'call_webhook') {
            const webhookAction = this.props.action as CallWebhook;

            initialState.method = webhookAction.method;

            if (substObj(webhookAction.headers)) {
                const existingHeaders = Object.keys(
                    webhookAction.headers
                ).map(key => ({
                    name: key,
                    value: webhookAction.headers[key],
                    uuid: generateUUID()
                }));

                initialState.headers.unshift(...existingHeaders);
            }
        }

        return initialState;
    }

    private addEmptyHeader(headers: Header[]): Header[] {
        const newHeaders: Header[] = headers;
        let hasEmpty = false;

        for (const header of newHeaders) {
            if (!header.name.trim().length && !header.value.trim().length) {
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

        if (this.props.action && this.props.action.type === 'call_webhook') {
            ({ method, url } = this.props.action as CallWebhook);
        }

        return {
            method,
            url
        };
    }

    private getSummary(): JSX.Element {
        const baseText = 'configure the headers';
        const linkText =
            this.state.method === Methods.GET
                ? baseText
                : `${baseText} and body`;

        return (
            <div>
                If you need to, you can also{' '}
                <a href="#" onClick={this.props.onToggleAdvanced}>
                    {linkText}
                </a>{' '}
                of your request.
            </div>
        );
    }

    private getReqBody(): string {
        let reqBody = DEFAULT_BODY;

        if (this.props.action.body) {
            ({ action: { body: reqBody } } = this.props);
        }

        return reqBody;
    }

    private renderForm(): JSX.Element {
        if (this.props.translating) {
            return this.props.getExitTranslations();
        }

        const {
            method,
            url
        }: { method: Methods; url: string } = this.getFormAttrs();

        const summary: JSX.Element = this.getSummary();

        return (
            <>
                <p>{WEBHOOK_LEGEND}</p>
                <div className={styles.method}>
                    <SelectElement
                        ref={this.props.onBindWidget}
                        name="MethodMap"
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
                        config={this.props.config}
                    />
                </div>
                <div className={styles.instructions}>
                    <p>
                        {summary} If your server responds with JSON, each
                        property will be added to the Flow.
                    </p>
                    <pre className={styles.code}>
                        {
                            '{ "product": "Solar Charging Kit", "stock level": 32 }'
                        }
                    </pre>
                    <p>
                        In this example{' '}
                        <span className={styles.example}>
                            @webhook.json.product
                        </span>{' '}
                        and{' '}
                        <span className={styles.example}>
                            @webhook.json["stock level"]
                        </span>{' '}
                        would be available in all future steps.
                    </p>
                </div>
            </>
        );
    }

    private renderAdvanced(): JSX.Element {
        if (this.props.translating) {
            return null;
        }

        const headerElements: JSX.Element[] = this.state.headers.map(
            (header: Header, index: number, arr: Header[]) => {
                const isEmpty = index === this.state.headers.length - 1;
                return (
                    <div key={header.uuid}>
                        <HeaderElement
                            ref={this.props.onBindAdvancedWidget}
                            name={`header_${header.uuid}`}
                            header={header}
                            onRemove={this.onHeaderRemoved}
                            onChange={this.onHeaderChanged}
                            index={index}
                            empty={isEmpty}
                            ComponentMap={this.props.ComponentMap}
                            config={this.props.config}
                        />
                    </div>
                );
            }
        );

        const reqBody = this.getReqBody();
        const helpText = `Modify the body of the ${this.state
            .method} request that will be sent to your webhook.`;
        const reqBodyLabel = `${this.state.method} Body`;
        const reqBodyHelp = `Modify the body of your ${this.state
            .method} request.`;

        const needsBody =
            this.state.method === Methods.POST ||
            this.state.method === Methods.PUT;

        const bodyForm: JSX.Element = needsBody ? (
            <div className={styles.bodyForm}>
                <h4>{reqBodyLabel}</h4>
                <p>{reqBodyHelp}</p>
                <TextInputElement
                    __className={styles.reqBody}
                    ref={this.props.onBindAdvancedWidget}
                    name="Body"
                    showLabel={false}
                    value={reqBody}
                    helpText={helpText}
                    autocomplete={true}
                    textarea={true}
                    required={true}
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
            </div>
        ) : null;

        return (
            <div>
                <h4 className={styles.headers_title}>Headers</h4>
                <p className={styles.info}>
                    Add any additional headers below that you would like to send
                    along with your request.
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
        return this.props.showAdvanced
            ? this.renderAdvanced()
            : this.renderForm();
    }
}
