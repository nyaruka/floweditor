import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { HeaderEntry } from '~/components/flow/routers/webhook/WebhookRouterForm';
import * as styles from '~/components/flow/routers/webhook/WebhookRouterForm.scss';
import FormElement from '~/components/form/FormElement';
import ConnectedTextInputElement from '~/components/form/textinput/TextInputElement';

// TODO: move this into webhook router component
export interface Header {
    uuid: string;
    name: string;
    value: string;
}

export interface HeaderElementProps {
    name: string;
    entry: HeaderEntry;
    index: number;
    onRemove: (header: HeaderElement) => void;
    onChange: (header: HeaderElement) => void;
    empty?: boolean;
}

interface HeaderElementState {
    name: string;
    value: string;
}

export const headerContainerSpecId = 'header-container';
export const nameContainerSpecId = 'name-container';
export const valueConatainerSpecId = 'value-container';
export const removeIcoSpecId = 'remove-icon';

export const HEADER_NAME_ERROR = 'HTTP headers must have a name';
export const NAME_PLACEHOLDER = 'Header Name';
export const VALUE_PLACEHOLDER = 'Value';

export default class HeaderElement extends React.Component<HeaderElementProps, HeaderElementState> {
    constructor(props: HeaderElementProps) {
        super(props);

        const header = this.props.entry.value;
        const name = header.name || '';
        const value = header.value || '';

        this.state = {
            name,
            value
        };

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    private handleChangeName(name: string): void {
        this.setState({ name }, () => this.props.onChange(this));
    }

    private handleChangeValue(value: string): void {
        this.setState({ value }, () => this.props.onChange(this));
    }

    private handleRemove(): void {
        this.props.onRemove(this);
    }

    private getRemoveIco(): JSX.Element {
        return (
            <div
                className={styles.removeIco}
                onClick={this.handleRemove}
                data-spec={removeIcoSpecId}
            >
                <span className="fe-x" />
            </div>
        );
    }

    public render(): JSX.Element {
        const hasHeaderError = false; // hasErrorType(this.state.errors, [/headers/]);
        const removeIco: JSX.Element = this.getRemoveIco();
        return (
            <FormElement name={this.props.name} entry={this.props.entry}>
                <div className={styles.header} data-spec={headerContainerSpecId}>
                    <div className={styles.header_name} data-spec={nameContainerSpecId}>
                        <ConnectedTextInputElement
                            placeholder={NAME_PLACEHOLDER}
                            name="name"
                            onChange={this.handleChangeName}
                            entry={{ value: this.state.name }}
                            showInvalid={hasHeaderError}
                        />
                    </div>
                    <div className={styles.header_value} data-spec={valueConatainerSpecId}>
                        <ConnectedTextInputElement
                            placeholder={VALUE_PLACEHOLDER}
                            name="value"
                            onChange={this.handleChangeValue}
                            entry={{ value: this.state.value }}
                            autocomplete={true}
                        />
                    </div>
                    {removeIco}
                </div>
            </FormElement>
        );
    }
}
