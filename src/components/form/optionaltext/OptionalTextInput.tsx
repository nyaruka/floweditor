import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { FormState, StringEntry } from '~/store/nodeEditor';

import * as styles from './OptionalTextInput.scss';

export interface OptionalTextInputProps {
    name: string;
    value: StringEntry;
    toggleText: string;
    onChange(value: string): void;
    helpText?: string;
}

export interface OptionalTextInputState extends FormState {
    editing: boolean;
}

/**
 * CaseList is a component made up of case elements that lets
 * the user configure rules and drag and drop to set their order.
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

    private handleUpdateResultName(resultName: string): void {
        this.props.onChange(resultName);
    }

    private handleShowEdit(): void {
        this.setState({ editing: true });
    }

    public render(): JSX.Element {
        let ele: JSX.Element;

        if (this.state.editing) {
            ele = (
                <TextInputElement
                    data-spec="name-field"
                    name={this.props.name}
                    showLabel={true}
                    entry={this.props.value}
                    onChange={this.handleUpdateResultName}
                    helpText={this.props.helpText}
                />
            );
        } else {
            ele = (
                <span
                    data-spec="name-field"
                    className={styles.toggleLink}
                    onClick={this.handleShowEdit}
                >
                    {this.props.toggleText}
                </span>
            );
        }

        return <div className={styles.optionalTextInput}>{ele}</div>;
    }
}
