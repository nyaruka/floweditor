import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import * as styles from '~/components/flow/routers/Webhook.scss';
import ConnectedTextInputElement from '~/components/form/textinputelement/TextInputElement';
import { renderIf } from '~/utils';

import FormElement from './FormElement';

export interface Header {
    uuid: string;
    name: string;
    value: string;
}

export interface HeaderElementProps {
    name: string;
    header: Header;
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

        const name = this.props.header.name || '';
        const value = this.props.header.value || '';

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

    private onRemove(): void {
        this.props.onRemove(this);
    }

    /* 
    // TOOO: this one needs cross field validation
    public validate(): boolean {
        const errors = [];

        const needsHeaderName =
            this.state.value.trim().length > 0 && this.state.name.trim().length === 0;

        if (needsHeaderName) {
            errors.push(HEADER_NAME_ERROR);
        }

        this.setState({ errors });

        return errors.length === 0;
    }
    */

    private getRemoveIco(): JSX.Element {
        return renderIf(this.props.index !== 0 && !this.props.empty)(
            <div className={styles.removeIco} onClick={this.onRemove} data-spec={removeIcoSpecId}>
                <span className="fe-remove" />
            </div>
        );
    }

    public render(): JSX.Element {
        const hasHeaderError = false; // hasErrorType(this.state.errors, [/headers/]);
        const removeIco: JSX.Element = this.getRemoveIco();
        return (
            <FormElement name={this.props.name}>
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
