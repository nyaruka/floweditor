import * as React from 'react';
import ComponentMap from '../../services/ComponentMap';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import FormElement from './FormElement';

import * as forms from './FormElement.scss';
import * as styles from '../routers/Webhook.scss';

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
    ComponentMap: ComponentMap;
}

interface HeaderElementState {
    name: string;
    value: string;
    errors: string[];
}

export default class HeaderElement extends React.Component<HeaderElementProps, HeaderElementState> {
    private category: TextInputElement;

    constructor(props: HeaderElementProps) {
        super(props);

        this.state = {
            name: this.props.header.name,
            value: this.props.header.value,
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

        if (this.state.value.trim().length > 0 && this.state.name.trim().length === 0) {
            errors.push('HTTP headers must have a name');
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    private getRemoveIco(): JSX.Element {
        if (this.props.index !== 0) {
            return (
                <div className={styles.remove_button} onClick={this.onRemove}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return null;
    }

    public render(): JSX.Element {
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
                        />
                    </div>
                    {removeIco}
                </div>
            </FormElement>
        );
    }
}
