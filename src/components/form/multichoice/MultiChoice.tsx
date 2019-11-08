import { react as bindCallbacks } from 'auto-bind';
import TextInputElement, { HTMLTextElement } from 'components/form/textinput/TextInputElement';
import Pill from 'components/pill/Pill';
import * as React from 'react';
import { StringArrayEntry, StringEntry, ValidationFailure } from 'store/nodeEditor';
import { Empty, validate } from 'store/validators';

import styles from './MultiChoice.module.scss';

export interface MultiChoiceInputProps {
  name: string;
  items: StringArrayEntry;
  entry?: StringEntry;
  onRemoved: (item: string) => void;
  onItemAdded: (item: string) => boolean;
  onFieldErrors: (validationFailures: ValidationFailure[]) => void;
  onEntryChanged?: (entry: StringEntry) => void;
  helpText?: JSX.Element;
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

    if (this.props.entry) {
      this.state = {
        currentInput: this.props.entry
      };
    } else {
      this.state = {
        currentInput: { value: '' }
      };
    }

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public handleInputChanged(value: string): void {
    this.setState({ currentInput: { value } });
    if (this.props.onEntryChanged) {
      this.props.onEntryChanged({ value });
    }
  }

  public handleAddItem(event: React.KeyboardEvent<HTMLTextElement>): boolean {
    // hack: we want to evaluate after the state is updated for validation errors
    window.setTimeout(() => {
      if ((this.state.currentInput.persistantFailures || []).length > 0) {
        return;
      }

      if (this.state.currentInput.value.trim().length > 0) {
        const newItem = this.state.currentInput.value.trim();

        if (this.props.onItemAdded(newItem)) {
          this.setState({ currentInput: { value: '' } });
        }

        if (this.props.onEntryChanged) {
          this.props.onEntryChanged({ value: '' });
        }
      }
    }, 0);
    return true;
  }

  private handleValidateEmpty(): void {
    const currentInput = validate(this.props.name, this.state.currentInput.value, [Empty]);
    this.setState({ currentInput }, () => {
      if (this.props.onEntryChanged) {
        this.props.onEntryChanged(currentInput);
      }
    });
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
          name={this.props.name}
          placeholder={this.props.name}
          showLabel={false}
          onChange={this.handleInputChanged}
          entry={this.state.currentInput}
          autocomplete={true}
          focus={true}
          onBlur={this.handleValidateEmpty}
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
                if (this.props.onEntryChanged) {
                  this.props.onEntryChanged(currentInput);
                }
              }
            );
          }}
        />
      </>
    );
  }
}
