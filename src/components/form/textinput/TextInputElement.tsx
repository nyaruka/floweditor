import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import FormElement, { FormElementProps } from 'components/form/FormElement';
import shared from 'components/form/FormElement.module.scss';
import CharCount from 'components/form/textinput/CharCount';
import { COMPLETION_HELP, KeyValues } from 'components/form/textinput/constants';
import ExcellentParser, { isWordChar } from 'components/form/textinput/ExcellentParser';
import { getMsgStats, UnicodeCharMap } from 'components/form/textinput/helpers';
import { Type, Types } from 'config/interfaces';
import * as React from 'react';
import { connect } from 'react-redux';
import { AssetStore, CompletionOption, FunctionExample } from 'store/flowContext';
import { StringEntry, ValidationFailure } from 'store/nodeEditor';
import AppState from 'store/state';
import getCaretCoordinates from 'textarea-caret';
import {
  CompletionSchema,
  getCompletions,
  getFunctions,
  getCompletionName,
  getCompletionSignature,
  CompletionAssets
} from 'utils/completion';

import styles from './TextInputElement.module.scss';

const ReactMarkdown = require('react-markdown');

// import setCaretPosition from 'get-input-selection';
export enum Count {
  SMS = 'SMS'
}

export interface Coordinates {
  left: number;
  top: number;
}

export type HTMLTextElement = HTMLTextAreaElement | HTMLInputElement;

export interface TextInputStoreProps {
  typeConfig: Type;
  assetStore: AssetStore;
  completionSchema: CompletionSchema;
  functions: CompletionOption[];
}

export interface TextInputPassedProps extends FormElementProps {
  entry?: StringEntry;
  __className?: string;
  count?: Count;
  textarea?: boolean;
  placeholder?: string;
  autocomplete?: boolean;
  focus?: boolean;
  showInvalid?: boolean;
  maxLength?: number;
  onFieldFailures?: (failures: ValidationFailure[]) => void;
  onChange?: (value: string, name?: string) => void;
  onBlur?: (event: React.ChangeEvent<HTMLTextElement>) => void;
  onEnter?: (event: React.KeyboardEvent<HTMLTextElement>) => boolean;
}

export type TextInputProps = TextInputStoreProps & TextInputPassedProps;

export interface TextInputState {
  value: string;
  caretCoordinates: Coordinates;
  completionVisible: boolean;
  selectedOptionIndex: number;
  matches: CompletionOption[];
  query: string;
  parts?: string[];
  characterCount?: number;
  unicodeChars?: UnicodeCharMap;
  fn?: CompletionOption;
}

type InitialState = Pick<
  TextInputState,
  'caretCoordinates' | 'completionVisible' | 'selectedOptionIndex' | 'matches' | 'query'
>;

const initialState: InitialState = {
  caretCoordinates: { left: 0, top: 0 },
  completionVisible: false,
  selectedOptionIndex: 0,
  matches: [],
  query: ''
};

const cx: any = classNames.bind({ ...styles, ...shared });

export class TextInputElement extends React.Component<TextInputProps, TextInputState> {
  private selectedEl: HTMLLIElement;
  private textEl: HTMLTextElement;
  private parser: ExcellentParser;
  private nextCaret = -1;
  private completion: CompletionAssets;

  constructor(props: TextInputProps) {
    super(props);

    this.completion = {
      schema: this.props.completionSchema,
      assetStore: this.props.assetStore
    };

    let initial = '';
    if (this.props.entry && this.props.entry.value) {
      initial = this.props.entry.value;
    }

    this.state = {
      value: initial,
      ...initialState,
      ...(this.props.count && this.props.count === Count.SMS ? getMsgStats(initial) : {})
    };

    this.parser = new ExcellentParser('@', [
      'contact',
      'child',
      'fields',
      'input',
      'parent',
      'results',
      'run',
      'trigger',
      'urns',
      'webhook'
    ]);

    bindCallbacks(this, {
      include: [/^on/, /Ref$/, 'setSelection', 'validate', /^has/, /^handle/]
    });
  }

  private selectedElRef(ref: HTMLLIElement): HTMLLIElement {
    return (this.selectedEl = ref);
  }

  private textElRef(ref: HTMLTextElement): HTMLTextElement {
    return (this.textEl = ref);
  }

  public componentWillReceiveProps(nextProps: TextInputProps): void {
    if (nextProps.entry.value !== this.props.entry.value || this.nextCaret > -1) {
      this.setState({ value: nextProps.entry.value }, () => {
        if (this.nextCaret > -1) {
          this.textEl.selectionStart = this.nextCaret;
          this.textEl.selectionEnd = this.nextCaret;
          this.nextCaret = -1;
        }
      });
    }
  }

  public componentDidMount(): void {
    this.checkForMissingFields();
    return this.props.focus && this.focusInput();
  }

  public componentDidUpdate(previous: TextInputProps): void {
    if (this.selectedEl) {
      if (this.selectedEl.scrollIntoView) {
        this.selectedEl.scrollIntoView(false);
      }
    }
  }

  private handleKeyDown(event: React.KeyboardEvent<HTMLTextElement>): void {
    if (!this.props.autocomplete) {
      return;
    }

    // if our parent cares about enter, give them a go at it
    if (event.key === KeyValues.KEY_ENTER && this.props.onEnter) {
      if (this.props.onEnter(event)) {
        return;
      }
    }

    switch (event.key) {
      case KeyValues.KEY_SPACE:
        if (event.ctrlKey) {
          this.reevaluate(event.currentTarget.value, event.currentTarget.selectionStart, true);
        }
        break;
      case KeyValues.KEY_P:
        if (event.ctrlKey) {
          if (this.state.completionVisible) {
            this.setSelection(this.state.selectedOptionIndex - 1);
            event.preventDefault();
          }
        }
        break;
      case KeyValues.KEY_UP:
        if (this.state.completionVisible) {
          this.setSelection(this.state.selectedOptionIndex - 1);
          event.preventDefault();
        }
        break;
      case KeyValues.KEY_N:
        if (event.ctrlKey) {
          if (this.state.completionVisible) {
            this.setSelection(this.state.selectedOptionIndex + 1);
            event.preventDefault();
          }
        }
        break;
      case KeyValues.KEY_DOWN:
        if (this.state.completionVisible) {
          this.setSelection(this.state.selectedOptionIndex + 1);
          event.preventDefault();
        }
        return;
      case KeyValues.KEY_AT:
        this.setState({
          completionVisible: true,
          caretCoordinates: getCaretCoordinates(this.textEl, this.textEl.selectionEnd)
        });
        return;
      case KeyValues.KEY_ESC:
        if (this.state.completionVisible) {
          this.setState({
            completionVisible: false
          });
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      case KeyValues.KEY_TAB:
      case KeyValues.KEY_ENTER:
        let caret = event.currentTarget.selectionStart;
        if (this.state.completionVisible && this.state.matches.length > 0) {
          const option = this.state.matches[this.state.selectedOptionIndex];
          let newValue = this.state.value.substr(0, caret - this.state.query.length);

          if (option.signature) {
            let parens = 1;
            if (option.signature.indexOf('()') > -1) {
              parens++;
            }

            newValue += option.signature.substring(0, option.signature.indexOf('(') + parens);
          } else {
            newValue += option.name;
          }

          const newCaret = newValue.length;

          // skip over adjacent text including dot completions
          for (const ch of this.state.value.substr(caret)) {
            if (isWordChar(ch) || ch === '.') {
              caret++;
            } else {
              break;
            }
          }

          newValue += this.state.value.substr(caret);

          let fn: CompletionOption = null;
          let query = '';
          let completionVisible = false;
          const matches: CompletionOption[] = [];
          if (event.key === KeyValues.KEY_TAB || option.signature) {
            query = option.name;
            matches.push(
              ...getCompletions(this.completion, query),
              ...getFunctions(this.props.functions, query)
            );
            completionVisible = matches.length > 0;
            if (option.signature && option.signature.indexOf('()') === -1) {
              fn = option;
            }
          }

          this.setState(
            {
              fn,
              query,
              value: newValue,
              matches,
              completionVisible,
              selectedOptionIndex: 0
            },
            () => {
              if (this.props.onChange) {
                this.props.onChange(this.state.value, this.props.name);
              }
              this.nextCaret = newCaret;
            }
          );

          event.preventDefault();
          event.stopPropagation();
          return;
        } else {
          if (this.props.onEnter) {
            this.checkForMissingFields();
            this.props.onEnter(event);
          }
        }
        return;
      case KeyValues.KEY_BACKSPACE:
        // go backwards on our value until we reach either a space or @
        this.executeQuery(event.currentTarget.value, event.currentTarget.selectionStart - 1);
        return;
    }
  }

  private reevaluate(value: string, selectionStart: number, force: boolean = false): void {
    if (this.state.completionVisible || force) {
      this.setState(this.executeQuery(value, selectionStart) as TextInputState);
    }
  }

  private handleKeyUp(event: React.KeyboardEvent<HTMLTextElement>): void {
    if (event.currentTarget) {
      const {
        currentTarget: { value, selectionStart }
      } = event;

      switch (event.key) {
        case KeyValues.KEY_P:
        case KeyValues.KEY_N:
          if (this.state.completionVisible && event.ctrlKey) {
            return;
          }
          this.reevaluate(value, selectionStart);
          return;

        case KeyValues.KEY_F:
        case KeyValues.KEY_B:
          this.reevaluate(value, selectionStart);
          return;

        case KeyValues.KEY_RIGHT:
        case KeyValues.KEY_LEFT:
          this.reevaluate(value, selectionStart);
          return;

        case KeyValues.KEY_UP:
        case KeyValues.KEY_DOWN:
          if (this.state.completionVisible) {
            return;
          }
          this.reevaluate(value, selectionStart);
      }
    }
  }

  private handleClick(event: React.MouseEvent<HTMLTextElement>): void {
    if (event.currentTarget) {
      const {
        currentTarget: { value, selectionStart }
      } = event;

      this.reevaluate(value, selectionStart);
    }
  }

  private checkForMissingFields(): boolean {
    // check if we have any bogus field references
    if (this.props.autocomplete && this.props.onFieldFailures) {
      const fields = this.parser.getContactFields(this.state.value);
      const missingFields = fields
        .filter((key: string) => !(key in this.props.assetStore.fields.items))
        .map((field: string) => {
          return {
            message: `${field} is not a valid contact field`
          };
        });

      this.props.onFieldFailures(missingFields);
      return missingFields.length > 0;
    }
    return false;
  }

  private handleBlur(event: React.ChangeEvent<HTMLTextElement>): void {
    if (this.checkForMissingFields()) {
      if (this.props.onBlur) {
        this.props.onBlur(event);
      }
      return;
    }

    this.setState(
      {
        query: '',
        matches: [],
        selectedOptionIndex: 0,
        completionVisible: false
      },
      () => this.props.onBlur && this.props.onBlur(event)
    );
  }

  private executeQuery(value: string, position: number): Partial<TextInputState> {
    // go backwards until we have a query
    const expression = this.parser.expressionContext(value.substr(0, position));

    let fn: CompletionOption = null;
    if (expression !== null) {
      const includeFunctions = expression.startsWith('(');

      if (includeFunctions) {
        const functionQuery = this.parser.functionContext(expression);
        if (functionQuery) {
          const fns = getFunctions(this.props.functions, functionQuery);
          if (fns.length > 0) {
            fn = fns[0];
          }
        }
      }

      for (let i = expression.length; i >= 0; i--) {
        const curr = expression[i];
        if (curr === '@' || curr === '(' || curr === ' ' || i === 0) {
          // don't include open parens or spaces
          if (curr === '(' || curr === ' ') {
            i++;

            if (!includeFunctions) {
              return {
                completionVisible: false
              };
            }
          }

          const query = expression.substr(i, expression.length - i);
          const matches = getCompletions(this.completion, query);

          if (includeFunctions) {
            matches.push(...getFunctions(this.props.functions, query));
          }

          const completionVisible = matches.length > 0;
          return {
            query,
            matches,
            completionVisible,
            selectedOptionIndex: 0,
            caretCoordinates: getCaretCoordinates(this.textEl, position - query.length),
            fn,
            value
          };
        }
      }
    }

    return {
      // keep our text field state
      value,

      // reset the others
      query: null,
      completionVisible: false,
      matches: [],
      selectedOptionIndex: 0
    };
  }

  private handleChange({
    currentTarget: { value, selectionStart }
  }: React.ChangeEvent<HTMLTextElement>): void {
    const updates: Partial<TextInputState> = this.executeQuery(value, selectionStart);

    if (this.props.autocomplete) {
      if (this.props.count === Count.SMS) {
        const { parts, characterCount, unicodeChars } = getMsgStats(value, true);
        updates.parts = parts;
        updates.characterCount = characterCount;
        updates.unicodeChars = unicodeChars;
      }

      updates.selectedOptionIndex = 0;
      this.setState(updates as TextInputState);
    }

    if (this.props.onChange) {
      this.props.onChange(value, this.props.name);
    }
  }

  private setSelection(selectedIdx: number): void {
    let selectedOptionIndex: number = selectedIdx;

    // Can't exceed the last option
    if (selectedIdx >= this.state.matches.length) {
      selectedOptionIndex = this.state.matches.length - 1;
    }

    // Can't go beyond the first option
    if (selectedIdx < 0) {
      selectedOptionIndex = 0;
    }

    if (selectedOptionIndex !== this.state.selectedOptionIndex) {
      this.setState({ selectedOptionIndex });
    }
  }

  private focusInput(): void {
    const {
      value: { length }
    } = this.textEl;
    this.textEl.focus();
    this.textEl.selectionStart = length;
  }

  private getOption(
    option: CompletionOption,
    showSummary: boolean = false,
    numExamples: number = 0
  ): JSX.Element {
    const name = getCompletionName(option);

    let summary = null;
    let examples = null;

    if (showSummary) {
      summary = (
        <div data-spec="option-summary" className={styles.option_summary}>
          <ReactMarkdown source={option.summary} />
        </div>
      );
    }

    if (option.examples && numExamples > 0) {
      examples = (
        <div data-spec="option-example" className={styles.option_examples}>
          <div className={styles.example_header}>
            EXAMPLE
            {numExamples !== 1 ? 'S' : ''}
          </div>

          <div className={styles.example}>
            {option.examples.slice(0, numExamples).map((example: FunctionExample, idx: number) => (
              <div key={option.name + '_example_' + idx}> {example.template}</div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <>
        <div data-spec="option-name" className={styles.option_name}>
          {option.signature ? <div className={styles.fn_marker}>ƒ</div> : null}
          {name}

          {showSummary && option.signature ? (
            <div className={styles.option_signature}>{getCompletionSignature(option)}</div>
          ) : null}
        </div>
        {summary}
        {examples}
      </>
    );
  }

  private getOptions(): JSX.Element[] {
    return this.state.matches.map((option: CompletionOption, idx: number) => {
      const optionClasses = [styles.option];

      if (idx === this.state.selectedOptionIndex) {
        optionClasses.push(styles.selected);

        if (idx === 0) {
          optionClasses.push(styles.first_option);
        }

        return (
          <li
            ref={this.selectedElRef}
            className={optionClasses.join(' ')}
            key={option.signature || option.name}
          >
            {this.getOption(option, true, 1)}
          </li>
        );
      }

      return (
        <li className={optionClasses.join(' ')} key={option.signature || option.name}>
          {this.getOption(option, false)}
        </li>
      );
    });
  }

  private hasErrors(): boolean {
    return this.getMergedErrors().length > 0;
  }

  private getMergedErrors(): ValidationFailure[] {
    if (this.props.entry) {
      return (this.props.entry.validationFailures || []).concat(
        this.props.entry.persistantFailures || []
      );
    }
    return [];
  }

  private getScroll(): number {
    if (this.textEl) {
      return this.textEl.scrollTop;
    }
    return 0;
  }

  private getError(): string {
    return this.props.entry.validationFailures && this.props.entry.validationFailures.length > 0
      ? this.props.entry.validationFailures[0].message
      : null;
  }

  private getTextElement(): JSX.Element {
    const textElClasses = cx({
      [styles.textinput]: true,
      [shared.invalid]: this.hasErrors() || this.props.showInvalid === true
    });

    let text = this.state.value;
    if (this.props.entry) {
      text = this.props.entry.value;
    }

    if (this.props.textarea) {
      return (
        <textarea
          name={this.props.name}
          data-spec="input"
          data-testid="input"
          ref={this.textElRef}
          className={textElClasses}
          value={text}
          onClick={this.handleClick}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          placeholder={this.props.placeholder}
          maxLength={this.props.maxLength || -1}
        />
      );
    } else {
      return (
        <input
          name={this.props.name}
          data-spec="input"
          data-testid="input"
          ref={this.textElRef}
          type="text"
          className={textElClasses}
          value={text}
          onClick={this.handleClick}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          placeholder={this.props.placeholder}
          maxLength={this.props.maxLength || -1}
        />
      );
    }
  }

  public render(): JSX.Element {
    const completionClasses = cx({
      [styles.completion_container]: true,
      [styles.hidden]: !this.state.completionVisible || this.state.matches.length === 0
    });

    const fnClasses = cx({
      [styles.fn_container]: true,
      [styles.hidden]: !this.state.completionVisible || this.state.matches.length === 0
    });
    const options: JSX.Element[] = this.getOptions();
    const charCount: JSX.Element =
      this.props.count && this.props.count === Count.SMS ? (
        <CharCount
          count={this.state.characterCount}
          parts={this.state.parts.length}
          unicodeChars={this.state.unicodeChars}
        />
      ) : null;

    const sendMsgError =
      this.hasErrors() &&
      this.props.name === 'Message' &&
      (this.props.typeConfig.type === Types.send_msg ||
        this.props.typeConfig.type === Types.send_broadcast);

    const showFn = this.state.fn && !this.state.query;

    return (
      <FormElement
        __className={this.props.__className}
        name={this.props.name}
        helpText={this.props.helpText}
        showLabel={this.props.showLabel}
        // errors={this.state.errors}
        entry={this.props.entry}
        sendMsgError={sendMsgError}
      >
        <div className={styles.wrapper}>
          {this.getTextElement()}
          <div
            className={completionClasses}
            style={{
              top: this.state.caretCoordinates.top - this.getScroll(),
              left: this.state.caretCoordinates.left
            }}
            data-spec="completion-options"
          >
            <div className={styles.options_wrapper}>
              <ul className={styles.option_list} data-spec="completion-list">
                {options}
              </ul>
              <div className={styles.help} data-spec="completion-help">
                {COMPLETION_HELP}
              </div>
            </div>

            {showFn ? (
              <div className={fnClasses}>{this.getOption(this.state.fn, true, 3)}</div>
            ) : null}
          </div>
        </div>
        {charCount}
      </FormElement>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = ({
  flowContext: { assetStore },
  editorState: { completionSchema, functions },
  nodeEditor: { typeConfig }
}: AppState) => ({
  typeConfig,
  assetStore,
  completionSchema,
  functions
});

const ConnectedTextInputElement = connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(TextInputElement);

export default ConnectedTextInputElement;
