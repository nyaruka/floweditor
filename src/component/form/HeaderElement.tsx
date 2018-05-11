import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import { hasErrorType, renderIf } from '../../utils';
import ConnectedTextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import * as styles from '../routers/Webhook.scss';
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
    errors: string[];
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
            value,
            errors: []
        };

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    private onChangeName({
        currentTarget: { value }
    }: React.SyntheticEvent<HTMLTextElement>): void {
        this.setState(
            {
                name: value
            },
            () => this.props.onChange(this)
        );
    }

    private onChangeValue({
        currentTarget: { value }
    }: React.SyntheticEvent<HTMLTextElement>): void {
        this.setState(
            {
                value
            },
            () => this.props.onChange(this)
        );
    }

    private onRemove(): void {
        this.props.onRemove(this);
    }

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

    private getRemoveIco(): JSX.Element {
        return renderIf(this.props.index !== 0 && !this.props.empty)(
            <div className={styles.removeIco} onClick={this.onRemove} data-spec={removeIcoSpecId}>
                <span className="fe-remove" />
            </div>
        );
    }

    public render(): JSX.Element {
        const hasHeaderError = hasErrorType(this.state.errors, [/headers/]);
        const removeIco: JSX.Element = this.getRemoveIco();
        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <div className={styles.header} data-spec={headerContainerSpecId}>
                    <div className={styles.header_name} data-spec={nameContainerSpecId}>
                        <ConnectedTextInputElement
                            placeholder={NAME_PLACEHOLDER}
                            name="name"
                            onChange={this.onChangeName}
                            value={this.state.name}
                            showInvalid={hasHeaderError}
                        />
                    </div>
                    <div className={styles.header_value} data-spec={valueConatainerSpecId}>
                        <ConnectedTextInputElement
                            placeholder={VALUE_PLACEHOLDER}
                            name="value"
                            onChange={this.onChangeValue}
                            value={this.state.value}
                            autocomplete={true}
                        />
                    </div>
                    {removeIco}
                </div>
            </FormElement>
        );
    }
}
