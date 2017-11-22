import * as React from 'react';
import ComponentMap from '../../services/ComponentMap';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';
import FormElement from './FormElement';

const forms = require('./FormElement.scss');
const styles = require('../routers/Webhook.scss');

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
    }

    private onChangeName(event: React.SyntheticEvent<HTMLTextElement>) {
        this.setState(
            {
                name: event.currentTarget.value
            },
            () => this.props.onChange(this)
        );
    }

    private onChangeValue(event: React.SyntheticEvent<HTMLTextElement>) {
        this.setState(
            {
                value: event.currentTarget.value
            },
            () => this.props.onChange(this)
        );
    }

    private onRemove(ele: any) {
        this.props.onRemove(this);
    }

    validate(): boolean {
        const errors: string[] = [];

        if (this.state.value.trim().length > 0) {
            if (this.state.name.trim().length == 0) {
                errors.push('HTTP headers must have a name');
            }
        }

        this.setState({ errors: errors });

        return errors.length === 0;
    }

    render() {
        const classes = [styles.header];

        if (this.state.errors.length > 0) {
            classes.push(forms.invalid);
        }

        return (
            <FormElement name={this.props.name} errors={this.state.errors} className={styles.group}>
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
                            autocomplete
                            ComponentMap={this.props.ComponentMap}
                        />
                    </div>
                    <div className={styles.remove_button} onClick={this.onRemove.bind(this)}>
                        <span className="icon-remove" />
                    </div>
                </div>
            </FormElement>
        );
    }
}
