import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { hasErrors } from '~/components/flow/actions/helpers';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import Pill from '~/components/pill/Pill';
import { StringArrayEntry, StringEntry, ValidationFailure } from '~/store/nodeEditor';

import * as styles from './MultiChoice.scss';

export interface MultiChoiceInputProps {
    items: StringArrayEntry;
    onRemoved: (item: string) => void;
    onItemAdded: (item: string) => boolean;
    onFieldErrors: (validationFailures: ValidationFailure[]) => void;
    helpText?: string;
}

interface MultiChoiceInputState {
    currentInput: StringEntry;
}

export default class MultiChoiceInput extends React.Component<
    MultiChoiceInputProps,
    MultiChoiceInputState
> {
    constructor(props: MultiChoiceInputProps) {
        super(props);

        this.state = {
            currentInput: { value: '' }
        };

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public handleInputChanged(value: string): void {
        this.setState({ currentInput: { value } });
    }

    public handleAddItem(): void {
        // hack: we want to evaluate after the state is updated for validation errors
        window.setTimeout(() => {
            if (hasErrors(this.state.currentInput)) {
                return;
            }

            if (this.state.currentInput.value.trim().length > 0) {
                const newItem = this.state.currentInput.value.trim();

                if (this.props.onItemAdded(newItem)) {
                    this.setState({ currentInput: { value: '' } });
                }
            }
        }, 0);
    }

    private getChosenItems(): JSX.Element {
        if (this.props.items.value.length > 0) {
            return (
                <div className={styles.chosen}>
                    {this.props.items.value.map((item: string) => (
                        <div key={`item_${item}`} className={styles.item}>
                            <Pill
                                icon="fe-x"
                                text={' ' + item}
                                large={true}
                                onClick={() => {
                                    this.props.onRemoved(item);
                                }}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    }

    public render(): JSX.Element {
        return (
            <>
                {this.getChosenItems()}
                {this.props.helpText ? <p>{this.props.helpText}</p> : <p />}
                <TextInputElement
                    name="Quick Reply"
                    placeholder="Quick Reply"
                    showLabel={false}
                    onChange={this.handleInputChanged}
                    entry={this.state.currentInput}
                    autocomplete={true}
                    focus={true}
                    onEnter={this.handleAddItem}
                    onFieldFailures={(persistantFailures: ValidationFailure[]) => {
                        const currentInput = {
                            ...this.state.currentInput,
                            persistantFailures
                        };
                        this.setState(
                            {
                                currentInput
                            },
                            () => {
                                this.props.onFieldErrors(persistantFailures);
                            }
                        );
                    }}
                />
            </>
        );
    }
}
