import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import setCaretPosition from 'get-input-selection';
import * as React from 'react';
import { connect } from 'react-redux';
import * as getCaretCoordinates from 'textarea-caret';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import * as shared from '~/components/form/FormElement.scss';
import CharCount from '~/components/form/textinput/CharCount';
import { COMPLETION_HELP, KeyValues } from '~/components/form/textinput/constants';
import ExcellentParser from '~/components/form/textinput/ExcellentParser';
import {
    filterOptions,
    getMsgStats,
    getOptionsList,
    UnicodeCharMap
} from '~/components/form/textinput/helpers';
import * as styles from '~/components/form/textinput/TextInputElement.scss';
import { Type, Types } from '~/config/typeConfigs';
import { AssetStore, CompletionOption } from '~/store/flowContext';
import { StringEntry } from '~/store/nodeEditor';
import AppState from '~/store/state';

export enum Count {
    SMS = 'SMS'
}

export interface Coordinates {
    left: number;
    top: number;
}

export interface HTMLTextElement {
    value: string;
    selectionStart: number;
    selectionEnd: number;
    focus(): void;
}

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
    onChange?(value: string): void;
    onBlur?(event: React.ChangeEvent<HTMLTextElement>): void;
}

export type TextInputProps = TextInputStoreProps & TextInputPassedProps;

export interface TextInputState {
    value: string;
    caretOffset: number;
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
    | 'caretOffset'
    | 'caretCoordinates'
    | 'completionVisible'
    | 'selectedOptionIndex'
    | 'matches'
    | 'query'
>;

const initialState: InitialState = {
    caretOffset: 0,
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
            'channel',
            'child',
            'parent',
            'contact',
            'date',
            'extra',
            'flow',
            'step'
        ]);

        // console.log(this.state.options);

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
        if (nextProps.entry.value !== this.props.entry.value) {
            this.setState({ value: nextProps.entry.value });
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

    private onKeyDown(event: React.KeyboardEvent<HTMLTextElement>): void {
        if (!this.props.autocomplete) {
            return;
        }

        switch (event.key) {
            case KeyValues.KEY_P:
                if (!event.ctrlKey) {
                    break;
                }
            case KeyValues.KEY_UP:
                if (this.state.completionVisible) {
                    this.setSelection(this.state.selectedOptionIndex - 1);
                    event.preventDefault();
                }
                break;
            case KeyValues.KEY_N:
                if (!event.ctrlKey) {
                    break;
                }
            case KeyValues.KEY_DOWN:
                if (this.state.completionVisible) {
                    this.setSelection(this.state.selectedOptionIndex + 1);
                    event.preventDefault();
                }
                break;
            case KeyValues.KEY_AT:
                this.setState({
                    completionVisible: true,
                    caretCoordinates: getCaretCoordinates(this.textEl, this.textEl.selectionEnd)
                });
                break;
            case KeyValues.KEY_ESC:
                if (this.state.completionVisible) {
                    this.setState({
                        completionVisible: false
                    });
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case KeyValues.KEY_TAB:
            case KeyValues.KEY_ENTER:
                if (this.state.completionVisible && this.state.matches.length > 0) {
                    const option = this.state.matches[this.state.selectedOptionIndex];
                    let newValue = this.state.value.substr(
                        0,
                        this.state.caretOffset - this.state.query.length
                    );

                    if (option.signature) {
                        newValue += option.signature.substring(
                            0,
                            option.signature.indexOf('(') + 1
                        );
                    } else {
                        newValue += option.name;
                    }

                    const newCaret = newValue.length;

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
                            caretOffset: newCaret,
                            completionVisible,
                            selectedOptionIndex: 0
                        },
                        () => {
                            setCaretPosition(this.textEl, newCaret);

                            if (this.props.onChange) {
                                this.props.onChange(this.state.value);
                            }
                        }
                    );

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case KeyValues.KEY_BACKSPACE:
                // go backwards on our value until we reach either a space or @
                this.executeQuery(
                    event.currentTarget.value,
                    event.currentTarget.selectionStart - 1
                );
                break;
            case KeyValues.KEY_SPACE:
                this.setState({
                    completionVisible: false
                });
                break;
        }
    }

    private onBlur(event: React.ChangeEvent<HTMLTextElement>): void {
        this.setState(
            {
                query: '',
                matches: [],
                caretOffset: 0,
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
                    }

                    const query = expression.substr(i, expression.length - i);
                    const matches = filterOptions(this.state.options, query, includeFunctions);

                    const completionVisible = matches.length > 0;
                    return {
                        query,
                        matches,
                        caretOffset: caret,
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
            query: null,
            completionVisible: false,
            matches: [],
            selectedOptionIndex: 0
        };
    }

    private handleChange({
        currentTarget: { value, selectionStart }
    }: React.ChangeEvent<HTMLTextElement>): void {
        if (this.props.autocomplete) {
            const updates: Partial<TextInputState> = this.executeQuery(value, selectionStart);

            if (this.props.count === Count.SMS) {
                const { parts, characterCount, unicodeChars } = getMsgStats(value, true);

                updates.parts = parts;
                updates.characterCount = characterCount;
                updates.unicodeChars = unicodeChars;
            }

            updates.caretOffset = selectionStart;
            updates.selectedOptionIndex = 0;
            this.setState(updates as TextInputState);
        }

        if (this.props.onChange) {
            this.props.onChange(value);
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

    private getOption(option: CompletionOption, selected: boolean): JSX.Element {
        const optionName = <div data-spec="option-name">{option.signature || option.name}</div>;

        // render a function
        if (option.signature) {
            if (selected) {
                return (
                    <>
                        {optionName}
                        <div data-spec="option-desc" className={styles.option_description}>
                            {option.summary}
                        </div>
                    </>
                );
            }
        }

        // otherwise, a variable completion
        if (selected) {
            return (
                <>
                    {optionName}
                    <div data-spec="option-desc" className={styles.option_description}>
                        {option.description}
                    </div>
                </>
            );
        }

        return optionName;
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

    private getQuery(expression: string): string {
        let parsed = this.parser.expressionContext(expression);
        if (parsed === null) {
            parsed = expression;
        }

        return parsed.substr(
            Math.max(parsed.lastIndexOf(' '), parsed.lastIndexOf('('), parsed.lastIndexOf('@')) + 1
        );
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
                    onChange={this.handleChange}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
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
                    onChange={this.handleChange}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
                    placeholder={this.props.placeholder}
                />
            );
        }
    }

    public render(): JSX.Element {
        const textElClasses = cx({
            [styles.textinput]: true,
            [shared.invalid]: this.hasErrors() || this.props.showInvalid === true
        });
        const completionClasses = cx({
            [styles.completion_container]: true,
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

        // Make sure we're rendering the right text element
        const TextElement = this.props.textarea ? 'textarea' : ('input' as string);
        const inputType = this.props.textarea ? undefined : 'text';

        let text = this.state.value;
        if (this.props.entry) {
            text = this.props.entry.value;
        }

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
                            top: this.state.caretCoordinates.top,
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
