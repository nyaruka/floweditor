import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import FlipMove = require('react-flip-move');
import Dialog, { ButtonSet, Tab } from '~/components/dialog/Dialog';
import { hasErrors } from '~/components/flow/actions/helpers';
import { RouterFormProps } from '~/components/flow/props';
import HeaderElement, { Header } from '~/components/flow/routers/webhook/header/HeaderElement';
import {
    GET_METHOD,
    METHOD_OPTIONS,
    MethodOption,
    Methods,
    nodeToState,
    stateToNode
} from '~/components/flow/routers/webhook/helpers';
import SelectElement from '~/components/form/select/SelectElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { DEFAULT_BODY } from '~/components/nodeeditor/constants';
import TypeList from '~/components/nodeeditor/TypeList';
import {
    FormEntry,
    FormState,
    mergeForm,
    StringEntry,
    ValidationFailure
} from '~/store/nodeEditor';
import { validate, validateRequired, validateURL } from '~/store/validators';
import { createUUID } from '~/utils';

const styles = require('./WebhookRouterForm.scss');

export interface HeaderEntry extends FormEntry {
    value: Header;
}

export interface MethodEntry extends FormEntry {
    value: MethodOption;
}

export interface WebhookRouterFormState extends FormState {
    headers: HeaderEntry[];
    method: MethodEntry;
    url: StringEntry;
    postBody: StringEntry;
}

export default class WebhookRouterForm extends React.Component<
    RouterFormProps,
    WebhookRouterFormState
> {
    constructor(props: RouterFormProps) {
        super(props);
        this.state = nodeToState(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    private handleUpdate(keys: {
        method?: MethodOption;
        url?: string;
        postBody?: string;
        header?: Header;
        removeHeader?: Header;
        validationFailures?: ValidationFailure[];
    }): boolean {
        const updates: Partial<WebhookRouterFormState> = {};

        let ensureEmptyHeader = false;

        if (keys.hasOwnProperty('method')) {
            updates.method = { value: keys.method };

            if (keys.method.value !== GET_METHOD.value) {
                if (!this.state.postBody.value) {
                    updates.postBody = { value: DEFAULT_BODY };
                }
            } else {
                updates.postBody = { value: null };
            }
        }

        if (keys.hasOwnProperty('url')) {
            updates.url = validate('URL', keys.url, [validateRequired, validateURL]);
        }

        if (keys.hasOwnProperty('postBody')) {
            updates.postBody = { value: keys.postBody };
        }

        if (keys.hasOwnProperty('header')) {
            updates.headers = [{ value: keys.header, validationFailures: keys.validationFailures }];
            ensureEmptyHeader = true;
        }

        let toRemove: any[] = [];
        if (keys.hasOwnProperty('removeHeader')) {
            toRemove = [{ headers: [{ value: keys.removeHeader }] }];
            ensureEmptyHeader = true;
        }

        const updated = mergeForm(this.state, updates, toRemove);

        // update our form
        this.setState(updated, () => {
            // if we updated headers, check if we need a new one
            if (ensureEmptyHeader) {
                let needsHeader = true;
                for (const header of this.state.headers) {
                    if (header.value.name.trim() === '') {
                        needsHeader = false;
                        break;
                    }
                }

                if (needsHeader) {
                    this.handleCreateHeader();
                }
            }
        });
        return updated.valid;
    }

    private handleMethodUpdate(method: MethodOption): boolean {
        return this.handleUpdate({ method });
    }

    private handleUrlUpdate(url: string): boolean {
        return this.handleUpdate({ url });
    }

    private handleHeaderRemoved(removeHeader: Header): boolean {
        return this.handleUpdate({ removeHeader });
    }

    private handleHeaderUpdated(header: Header, validationFailures: ValidationFailure[]): boolean {
        return this.handleUpdate({ header, validationFailures });
    }

    private handleCreateHeader(): boolean {
        return this.handleUpdate({
            header: {
                uuid: createUUID(),
                name: '',
                value: ''
            }
        });
    }

    private handlePostBodyUpdate(postBody: string): boolean {
        return this.handleUpdate({ postBody });
    }

    private handleSave(): void {
        // validate our url in case they haven't interacted
        const valid = this.state.valid && this.handleUrlUpdate(this.state.url.value);
        if (valid) {
            this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    private renderEdit(): JSX.Element {
        const typeConfig = this.props.typeConfig;

        const headerElements: JSX.Element[] = this.state.headers.map(
            (header: HeaderEntry, index: number, arr: HeaderEntry[]) => {
                return (
                    <div key={`header_${header.value.uuid}`}>
                        <HeaderElement
                            entry={header}
                            onRemove={this.handleHeaderRemoved}
                            onChange={this.handleHeaderUpdated}
                            index={index}
                        />
                    </div>
                );
            }
        );

        const tabs: Tab[] = [];
        tabs.push({
            name: 'HTTP Headers',
            hasErrors: !!this.state.headers.find((header: HeaderEntry) => hasErrors(header)),
            body: (
                <>
                    <p className={styles.info}>
                        Add any additional headers below that you would like to send along with your
                        request.
                    </p>
                    <FlipMove
                        easing="ease-out"
                        enterAnimation="elevator"
                        leaveAnimation="elevator"
                        duration={100}
                    >
                        {headerElements}
                    </FlipMove>
                </>
            ),
            checked: this.state.headers.length > 1
        });

        const method = this.state.method.value.value;
        if (method === Methods.POST || method === Methods.PUT) {
            tabs.push({
                name: 'POST Body',
                body: (
                    <div key="post_body" className={styles.bodyForm}>
                        <h4>{this.state.method.value.label} Body</h4>
                        <p>Modify the body of your {this.state.method.value.label} request.</p>
                        <TextInputElement
                            __className={styles.reqBody}
                            name="Body"
                            showLabel={false}
                            entry={this.state.postBody}
                            onChange={this.handlePostBodyUpdate}
                            helpText={`Modify the body of the ${this.state.method.value.label} 
                        request that will be sent to your webhook.`}
                            onFieldFailures={(persistantFailures: ValidationFailure[]) => {
                                const postBody = { ...this.state.postBody, persistantFailures };
                                this.setState({
                                    postBody,
                                    valid: this.state.valid && !hasErrors(postBody)
                                });
                            }}
                            autocomplete={true}
                            textarea={true}
                        />
                    </div>
                ),
                checked: this.state.postBody.value !== DEFAULT_BODY
            });
        }

        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
                tabs={tabs}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <div className={styles.method}>
                    <SelectElement
                        name="MethodMap"
                        entry={this.state.method}
                        onChange={this.handleMethodUpdate}
                        options={METHOD_OPTIONS}
                    />
                </div>
                <div className={styles.url}>
                    <TextInputElement
                        name="URL"
                        placeholder="Enter a URL"
                        entry={this.state.url}
                        onChange={this.handleUrlUpdate}
                        onFieldFailures={(persistantFailures: ValidationFailure[]) => {
                            const url = { ...this.state.url, persistantFailures };
                            this.setState({ url, valid: this.state.valid && !hasErrors(url) });
                        }}
                        autocomplete={true}
                    />
                </div>
                <div className={styles.instructions}>
                    <p>
                        If your server responds with JSON, each property will be added to the Flow.
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
            </Dialog>
        );
    }

    public render(): JSX.Element {
        return this.renderEdit();
    }
}
