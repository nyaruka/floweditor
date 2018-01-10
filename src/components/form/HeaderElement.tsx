import * as React from 'react';
import { hasErrorType } from '../../helpers/utils';
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
    onRemove(header: HeaderElement): void;
    onChange(header: HeaderElement): void;
    ComponentMap: ComponentMap;
}

interface HeaderElementState {
    name: string;
    value: string;
    errors: string[];
}

export default class HeaderElement extends React.Component<HeaderElementProps, HeaderElementState> {
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

    private onChangeName(event: React.SyntheticEvent<HTMLTextElement>): void {
        this.setState(
            {
                name: event.currentTarget.value
            },
            () => this.props.onChange(this)
        );
    }

    private onChangeValue(event: React.SyntheticEvent<HTMLTextElement>): void {
        this.setState(
            {
                value: event.currentTarget.value
            },
            () => this.props.onChange(this)
        );
    }

    private onRemove(ele: any): void {
        this.props.onRemove(this);
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.state.value.trim().length > 0) {
            if (this.state.name.trim().length === 0) {
                errors.push('HTTP headers must have a name');
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    public render(): JSX.Element {
        const hasHeaderError = hasErrorType(this.state.errors, ['headers']);

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
                        />
                    </div>
                    <div className={styles.remove_button} onClick={this.onRemove}>
                        <span className="icon-remove" />
                    </div>
                </div>
            </FormElement>
        );
    }
}
