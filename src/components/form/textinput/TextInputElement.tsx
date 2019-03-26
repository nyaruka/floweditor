import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import { connect } from 'react-redux';
import * as getCaretCoordinates from 'textarea-caret';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import * as shared from '~/components/form/FormElement.scss';
import CharCount from '~/components/form/textinput/CharCount';
import { COMPLETION_HELP, KeyValues } from '~/components/form/textinput/constants';
import ExcellentParser, { isWordChar } from '~/components/form/textinput/ExcellentParser';
import {
    filterOptions,
    getMsgStats,
    getOptionsList,
    UnicodeCharMap
} from '~/components/form/textinput/helpers';
import * as styles from '~/components/form/textinput/TextInputElement.scss';
import { Type, Types } from '~/config/interfaces';
import {
    AssetStore,
    CompletionOption,
    getCompletionName,
    getCompletionSignature
} from '~/store/flowContext';
import { StringEntry } from '~/store/nodeEditor';
import AppState from '~/store/state';

// import setCaretPosition from 'get-input-selection';
export enum Count {
    SMS = 'SMS'
}

export interface Coordinates {
    left: number;
    top: number;
}

type HTMLTextElement = HTMLTextAreaElement | HTMLInputElement;

export interface TextInputStoreProps {
    typeConfig: Type;
    assetStore: AssetStore;
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
    onChange?(value: string, missingFields?: string[]): void;
    onBlur?(event: React.ChangeEvent<HTMLTextElement>): void;
}

export type TextInputProps = TextInputStoreProps & TextInputPassedProps;

export interface TextInputState {
    value: string;
    caretCoordinates: Coordinates;
    completionVisible: boolean;
    selectedOptionIndex: number;
    matches: CompletionOption[];
    query: string;
    options: CompletionOption[];
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

const cx = classNames.bind({ ...styles, ...shared });

export class TextInputElement extends React.Component<TextInputProps, TextInputState> {
    private selectedEl: HTMLLIElement;
    private textEl: HTMLTextElement;
    private parser: ExcellentParser;
    private nextCaret = -1;

    constructor(props: TextInputProps) {
        super(props);

        let initial = '';
        if (this.props.entry && this.props.entry.value) {
            initial = this.props.entry.value;
        }

        this.state = {
            value: initial,
            options: getOptionsList(this.props.autocomplete, this.props.assetStore),
            ...initialState,
            ...(this.props.count && this.props.count === Count.SMS ? getMsgStats(initial) : {})
        };

        this.parser = new ExcellentParser('@', [
            'trigger',
            'run',
            'results',
            'child',
            'parent',
            'contact',
            'date',
            'fields',
            'urns'
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

        switch (event.key) {
            case KeyValues.KEY_SPACE:
                if (event.ctrlKey) {
                    this.reevaluate(
                        event.currentTarget.value,
                        event.currentTarget.selectionStart,
                        true
                    );
                }
                break;
            case KeyValues.KEY_P:
                if (!event.ctrlKey) {
                    break;
                }
            case KeyValues.KEY_UP:
                if (this.state.completionVisible) {
                    this.setSelection(this.state.selectedOptionIndex - 1);
                    event.preventDefault();
                }
                return;
            case KeyValues.KEY_N:
                if (!event.ctrlKey) {
                    break;
                }
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
                        newValue += option.signature.substring(
                            0,
                            option.signature.indexOf('(') + 1
                        );
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

                    let query = '';
                    let completionVisible = false;
                    const matches: CompletionOption[] = [];
                    if (event.key === KeyValues.KEY_TAB) {
                        query = option.name;
                        matches.push(...filterOptions(this.state.options, query, true));
                        completionVisible = matches.length > 0;
                    }

                    this.setState(
                        {
                            query,
                            value: newValue,
                            matches,
                            completionVisible,
                            selectedOptionIndex: 0
                        },
                        () => {
                            if (this.props.onChange) {
                                this.props.onChange(this.state.value);
                            }
                            this.nextCaret = newCaret;
                        }
                    );

                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                return;
            case KeyValues.KEY_BACKSPACE:
                // go backwards on our value until we reach either a space or @
                this.executeQuery(
                    event.currentTarget.value,
                    event.currentTarget.selectionStart - 1
                );
                return;
            case KeyValues.KEY_SPACE:
                this.setState({
                    completionVisible: false
                });
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

    private handleBlur(event: React.ChangeEvent<HTMLTextElement>): void {
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
        const caret = position - 1;
        const expression = this.parser.expressionContext(value.substr(0, position));

        let fn: CompletionOption = null;
        if (expression !== null) {
            const includeFunctions = expression.startsWith('(');

            if (includeFunctions) {
                const functionQuery = this.parser.functionContext(expression);
                if (functionQuery) {
                    const fns = filterOptions(this.state.options, functionQuery, includeFunctions);
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
                    const matches = filterOptions(this.state.options, query, includeFunctions);

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

        let missingFields: string[] = [];
        if (this.props.autocomplete) {
            const fields = this.parser.getContactFields(value);
            missingFields = fields.filter(
                (key: string) => !(key in this.props.assetStore.fields.items)
            );

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
            this.props.onChange(value, missingFields);
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
        showExamples: boolean = false
    ): JSX.Element {
        const name = getCompletionName(option);

        let summary = null;
        let examples = null;

        if (showSummary) {
            summary = (
                <div data-spec="option-summary" className={styles.optionSummary}>
                    {option.summary}
                </div>
            );
        }

        if (showExamples) {
            examples = (
                <div data-spec="option-example" className={styles.optionExample}>
                    <div className={styles.forExample}>EXAMPLE</div>
                    {option.examples[0].template}
                </div>
            );
        }

        return (
            <>
                <div data-spec="option-name" className={styles.optionName}>
                    {option.signature ? <div className={styles.fnMarker}>ƒ</div> : null}
                    {name}

                    {showSummary && option.signature ? (
                        <div className={styles.option_signature}>
                            {getCompletionSignature(option)}
                        </div>
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
                        {this.getOption(option, true)}
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
        return (
            this.props.entry &&
            this.props.entry.validationFailures &&
            this.props.entry.validationFailures.length > 0
        );
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
                    data-spec="input"
                    ref={this.textElRef}
                    className={textElClasses}
                    value={text}
                    onClick={this.handleClick}
                    onChange={this.handleChange}
                    onBlur={this.handleBlur}
                    onKeyDown={this.handleKeyDown}
                    onKeyUp={this.handleKeyUp}
                    placeholder={this.props.placeholder}
                />
            );
        } else {
            return (
                <input
                    data-spec="input"
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
                />
            );
        }
    }

    public render(): JSX.Element {
        const completionClasses = cx({
            [styles.completionContainer]: true,
            [styles.hidden]: !this.state.completionVisible || this.state.matches.length === 0
        });

        const fnClasses = cx({
            [styles.fnContainer]: true,
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
                    {this.state.fn ? (
                        <div
                            className={fnClasses}
                            style={{
                                top: this.state.caretCoordinates.top - this.getScroll() - 105,
                                left: this.state.caretCoordinates.left,
                                height: 100
                            }}
                        >
                            {this.getOption(this.state.fn, true, true)}
                        </div>
                    ) : null}
                    <div
                        className={completionClasses}
                        style={{
                            top: this.state.caretCoordinates.top - this.getScroll(),
                            left: this.state.caretCoordinates.left
                        }}
                        data-spec="completion-options"
                    >
                        <ul className={styles.option_list} data-spec="completion-list">
                            {options}
                        </ul>
                        <div className={styles.help} data-spec="completion-help">
                            {COMPLETION_HELP}
                        </div>
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
    nodeEditor: { typeConfig }
}: AppState) => ({
    typeConfig,
    assetStore
});

const ConnectedTextInputElement = connect(
    mapStateToProps,
    null,
    null,
    { withRef: true }
)(TextInputElement);

export default ConnectedTextInputElement;
