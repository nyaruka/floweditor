import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import * as styles from '~/components/form/optionaltext/OptionalTextInput.scss';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { FormState, StringEntry } from '~/store/nodeEditor';

export interface OptionalTextInputProps {
    name: string;
    value: StringEntry;
    toggleText: string;
    onChange(value: string): void;
    helpText?: string;
    maxLength?: number;
}

export interface OptionalTextInputState extends FormState {
    editing: boolean;
}

/**
 * OptionalText is a hideable text box
 */
export default class OptionalTextInput extends React.Component<
    OptionalTextInputProps,
    OptionalTextInputState
> {
    constructor(props: OptionalTextInputProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^handle/]
        });

        this.state = { editing: this.props.value.value.trim().length > 0, valid: true };
    }

    private handleTextChanged(text: string): void {
        this.props.onChange(text);
    }

    private handleEditingChanged(): void {
        this.setState({ editing: true });
    }

    public render(): JSX.Element {
        let ele: JSX.Element;

        if (this.state.editing) {
            ele = (
                <TextInputElement
                    data-spec="optional-field"
                    name={this.props.name}
                    showLabel={true}
                    entry={this.props.value}
                    onChange={this.handleTextChanged}
                    helpText={this.props.helpText}
                    maxLength={this.props.maxLength}
                />
            );
        } else {
            ele = (
                <span
                    data-spec="toggle-link"
                    className={styles.toggleLink}
                    onClick={this.handleEditingChanged}
                >
                    {this.props.toggleText}
                </span>
            );
        }

        return <div className={styles.optionalTextInput}>{ele}</div>;
    }
}
