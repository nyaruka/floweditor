import * as React from 'react';
import ComponentMap from '../../services/ComponentMap';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import FormElement from './FormElement';
import { Type } from '../../providers/ConfigProvider/typeConfigs';

import * as forms from './FormElement.scss';
import * as styles from '../routers/Webhook.scss';
import { hasErrorType } from '../../helpers/utils';

export interface Header {
    uuid: string;
    name: string;
    value: string;
}

export interface HeaderElementProps {
    name: string;
    header: Header;
    index: number;
    config: Type;
    ComponentMap: ComponentMap;
    onRemove: (header: HeaderElement) => void;
    onChange: (header: HeaderElement) => void;
    empty?: boolean;
}

interface HeaderElementState {
    name: string;
    value: string;
    errors: string[];
}

export default class HeaderElement extends React.Component<HeaderElementProps, HeaderElementState> {
    constructor(props: HeaderElementProps) {
        super(props);

        const name: string = this.props.header.name || '';
        const value: string = this.props.header.value || '';

        this.state = {
            name,
            value,
            errors: []
        };

        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeValue = this.onChangeValue.bind(this);
        this.onRemove = this.onRemove.bind(this);
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
        const errors: string[] = [];

        const needsHeaderName: boolean =
            this.state.value.trim().length > 0 && this.state.name.trim().length === 0;

        if (needsHeaderName) {
            errors.push('HTTP headers must have a name');
        }

        this.setState({ errors });

        const isValid: boolean = errors.length === 0;

        return isValid;
    }

    private getRemoveIco(): JSX.Element {
        const showRemove: boolean = this.props.index !== 0 && !this.props.empty;

        if (showRemove) {
            return (
                <div className={styles.removeIco} onClick={this.onRemove}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return null;
    }

    public render(): JSX.Element {
        const hasHeaderError: boolean = hasErrorType(this.state.errors, ['headers']);
        const removeIco: JSX.Element = this.getRemoveIco();

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <div className={styles.header}>
                    <div className={styles.header_name}>
                        <TextInputElement
                            placeholder="Header Name"
                            name="name"
                            onChange={this.onChangeName}
                            value={this.state.name}
                            ComponentMap={this.props.ComponentMap}
                            config={this.props.config}
                            showInvalid={hasHeaderError}
                        />
                    </div>
                    <div className={styles.header_value}>
                        <TextInputElement
                            placeholder="Value"
                            name="value"
                            onChange={this.onChangeValue}
                            value={this.state.value}
                            autocomplete={true}
                            ComponentMap={this.props.ComponentMap}
                            config={this.props.config}
                        />
                    </div>
                    {removeIco}
                </div>
            </FormElement>
        );
    }
}
