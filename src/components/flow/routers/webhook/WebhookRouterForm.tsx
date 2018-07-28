import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import FlipMove = require('react-flip-move');
import { v4 as generateUUID } from 'uuid';
import Dialog, { ButtonSet, HeaderStyle } from '~/components/dialog/Dialog';
import Flipper, { FlipperProps } from '~/components/flipper/Flipper';
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
import TypeList from '~/components/nodeeditor/TypeList';
import { Type } from '~/config/typeConfigs';
import { Asset } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import {
    FormEntry,
    FormState,
    mergeForm,
    NodeEditorSettings,
    StringEntry
} from '~/store/nodeEditor';
import { validate, validateRequired, validateURL } from '~/store/validators';

// tslint:disable:ban-types
const styles = require('./WebhookRouterForm.scss');

export interface WebhookRouterFormProps {
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;

    // localization settings
    translating: boolean;
    language: Asset;

    // update handlers
    updateRouter(renderNode: RenderNode): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

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

export class WebhookRouterForm extends React.Component<
    WebhookRouterFormProps,
    WebhookRouterFormState
> {
    private flipper: Flipper;

    constructor(props: WebhookRouterFormProps) {
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
    }): boolean {
        const updates: Partial<WebhookRouterFormState> = {};

        let ensureEmptyHeader = false;

        if (keys.hasOwnProperty('method')) {
            updates.method = { value: keys.method };
        }

        if (keys.hasOwnProperty('url')) {
            updates.url = validate('URL', keys.url, [validateRequired, validateURL]);
        }

        if (keys.hasOwnProperty('postBody')) {
            updates.postBody = { value: keys.postBody };
        }

        if (keys.hasOwnProperty('header')) {
            updates.headers = [{ value: keys.header }];
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

    private handleHeaderRemoved(header: HeaderElement): boolean {
        return this.handleUpdate({
            removeHeader: { ...header.state, uuid: header.props.entry.value.uuid }
        });
    }

    private handleHeaderUpdated(header: HeaderElement): boolean {
        return this.handleUpdate({
            header: { ...header.state, uuid: header.props.entry.value.uuid }
        });
    }

    private handleCreateHeader(): boolean {
        return this.handleUpdate({
            header: {
                uuid: generateUUID(),
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
        this.handleUrlUpdate(this.state.url.value);

        if (this.state.valid) {
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

    private getSummary(): JSX.Element {
        const baseText = 'configure the headers';
        const linkText = this.state.method.value === GET_METHOD ? baseText : `${baseText} and body`;

        return (
            <>
                If you need to, you can also{' '}
                <span className={styles.link} onClick={this.handleFlip}>
                    {linkText}
                </span>{' '}
                of your request.{' '}
            </>
        );
    }

    private renderEdit(): FlipperProps {
        const headerElements: JSX.Element[] = this.state.headers.map(
            (header: HeaderEntry, index: number, arr: HeaderEntry[]) => {
                return (
                    <div key={header.value.uuid}>
                        <HeaderElement
                            name={`header_${header.value.uuid}`}
                            entry={header}
                            onRemove={this.handleHeaderRemoved}
                            onChange={this.handleHeaderUpdated}
                            index={index}
                        />
                    </div>
                );
            }
        );

        const method = this.state.method.value.value;
        const needsBody = method === Methods.POST || method === Methods.PUT;
        const bodyForm: JSX.Element = needsBody ? (
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
                    autocomplete={true}
                    textarea={true}
                />
            </div>
        ) : null;

        return {
            front: (
                <Dialog
                    title={this.props.typeConfig.name}
                    headerClass={this.props.typeConfig.type}
                    buttons={this.getButtons()}
                >
                    <TypeList
                        __className=""
                        initialType={this.props.typeConfig}
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
                            autocomplete={true}
                        />
                    </div>
                    <div className={styles.instructions}>
                        <p>
                            {this.getSummary()}
                            If your server responds with JSON, each property will be added to the
                            Flow.
                        </p>
                        <pre className={styles.code}>
                            {'{ "product": "Solar Charging Kit", "stock level": 32 }'}
                        </pre>
                        <p>
                            In this example{' '}
                            <span className={styles.example}>@webhook.json.product</span> and{' '}
                            <span className={styles.example}>@webhook.json["stock level"]</span>{' '}
                            would be available in all future steps.
                        </p>
                    </div>
                </Dialog>
            ),
            back: (
                <Dialog
                    title={this.props.typeConfig.name}
                    subtitle="Advanced Settings"
                    buttons={this.getButtons()}
                    headerStyle={HeaderStyle.BARBER}
                    headerClass={this.props.typeConfig.type}
                    headerIcon="fe-cog"
                >
                    <h4 className={styles.headers_title}>Headers</h4>
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
                    {bodyForm}
                </Dialog>
            )
        };
    }

    private handleFlip(): void {
        this.flipper.handleFlip();
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            // we can translate our exits
        } else {
            return (
                <Flipper
                    ref={flipper => {
                        this.flipper = flipper;
                    }}
                    {...this.renderEdit()}
                />
            );
        }
    }
}
