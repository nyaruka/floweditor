import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import setCaretPosition from 'get-input-selection';
import * as React from 'react';
import { connect } from 'react-redux';
import getCaretCoordinates from 'textarea-caret';

import { Type } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { AppState, CompletionOption } from '../../../store';
import FormElement, { FormElementProps } from '../FormElement';
import * as shared from '../FormElement.scss';
import CharCount from './CharCount';
import {
    COMPLETION_HELP,
    KEY_AT,
    KEY_BACKSPACE,
    KEY_DOWN,
    KEY_ENTER,
    KEY_ESC,
    KEY_N,
    KEY_P,
    KEY_SPACE,
    KEY_TAB,
    KEY_UP
} from './constants';
import { filterOptions, getMsgStats, getOptionsList, isValidURL, UnicodeCharMap } from './helpers';
import * as styles from './TextInputElement.scss';

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
    resultNames: CompletionOption[];
}

export interface TextInputPassedProps extends FormElementProps {
    value: string;
    __className?: string;
    count?: Count;
    url?: boolean;
    textarea?: boolean;
    placeholder?: string;
    autocomplete?: boolean;
    focus?: boolean;
    showInvalid?: boolean;
    onChange?(event: React.ChangeEvent<HTMLTextElement>): void;
    onBlur?(event: React.ChangeEvent<HTMLTextElement>): void;
}

export type TextInputProps = TextInputStoreProps & TextInputPassedProps;

export interface TextInputState {
    value: string;
    errors: string[];
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
}

type InitialState = Pick<
    TextInputState,
    | 'caretOffset'
    | 'caretCoordinates'
    | 'errors'
    | 'completionVisible'
    | 'selectedOptionIndex'
    | 'matches'
    | 'query'
>;

const initialState: InitialState = {
    caretOffset: 0,
    caretCoordinates: { left: 0, top: 0 },
    errors: [],
    completionVisible: false,
    selectedOptionIndex: 0,
    matches: [],
    query: ''
};

const cx = classNames.bind({ ...styles, ...shared });

export class TextInputElement extends React.Component<TextInputProps, TextInputState> {
    private selectedEl: HTMLLIElement;
    private textEl: HTMLTextElement;

    constructor(props: TextInputProps) {
        super(props);

        this.state = {
            value: this.props.value,
            options: getOptionsList(this.props.autocomplete, this.props.resultNames || []),
            ...initialState,
            ...(this.props.count && this.props.count === Count.SMS
                ? getMsgStats(this.props.value)
                : {})
        };

        bindCallbacks(this, {
            include: [/^on/, /Ref$/, 'setSelection', 'validate']
        });
    }

    private selectedElRef(ref: HTMLLIElement): HTMLLIElement {
        return (this.selectedEl = ref);
    }

    private textElRef(ref: HTMLTextElement): HTMLTextElement {
        return (this.textEl = ref);
    }

    public componentWillReceiveProps(nextProps: TextInputProps): void {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value });
        }
    }

    public componentDidMount(): void {
        return this.props.focus && this.focusInput();
    }

    public componentDidUpdate(previous: TextInputProps): void {
        return this.selectedEl && this.selectedEl.scrollIntoView(false);
    }

    private onKeyDown(event: React.KeyboardEvent<HTMLTextElement>): void {
        if (!this.props.autocomplete) {
            return;
        }

        switch (event.keyCode) {
            case KEY_P:
                if (!event.ctrlKey) {
                    break;
                }
            case KEY_UP:
                if (this.state.completionVisible) {
                    this.setSelection(this.state.selectedOptionIndex - 1);
                    event.preventDefault();
                }
                break;
            case KEY_N:
                if (!event.ctrlKey) {
                    break;
                }
            case KEY_DOWN:
                if (this.state.completionVisible) {
                    this.setSelection(this.state.selectedOptionIndex + 1);
                    event.preventDefault();
                }
                break;
            case KEY_AT:
                this.setState({
                    completionVisible: true,
                    caretCoordinates: getCaretCoordinates(this.textEl, this.textEl.selectionEnd)
                });
                break;
            case KEY_ESC:
                if (this.state.completionVisible) {
                    this.setState({
                        completionVisible: false
                    });
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case KEY_TAB:
            case KEY_ENTER:
                if (this.state.completionVisible && this.state.matches.length > 0) {
                    const option = this.state.matches[this.state.selectedOptionIndex];
                    let newValue = this.state.value.substr(
                        0,
                        this.state.caretOffset - this.state.query.length
                    );
                    newValue += option.name;

                    const newCaret = newValue.length;
                    newValue += this.state.value.substr(this.state.caretOffset);

                    var query = '';
                    var completionVisible = false;
                    var matches: CompletionOption[] = [];
                    if (event.keyCode === KEY_TAB) {
                        query = option.name;
                        matches = filterOptions(this.state.options, query);
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
                        }
                    );

                    /** TODO: set caret position */
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case KEY_BACKSPACE:
                // Iterate backwards on our value until we reach either a space or @
                const caret = event.currentTarget.selectionStart - 1;
                for (let i = caret - 1; i >= 0; i--) {
                    const curr = this.state.value[i];
                    /** Space, don't do anything but break out */
                    if (curr === ' ') {
                        break;
                    }

                    // if '@' we display completion menu again
                    if (curr === '@') {
                        query = this.state.value.substr(i + 1, caret - i - 1);
                        matches = filterOptions(this.state.options, query);
                        completionVisible = matches.length > 0;
                        return this.setState({
                            query,
                            matches,
                            caretOffset: caret,
                            completionVisible,
                            selectedOptionIndex: 0,
                            caretCoordinates: getCaretCoordinates(this.textEl, i)
                        });
                    }
                }

                // We are visible still but really shouldn't be, clear out
                if (this.state.completionVisible) {
                    this.setState({
                        query: '',
                        matches: [],
                        caretOffset: caret,
                        completionVisible: false,
                        selectedOptionIndex: 0
                    });
                }
                break;
            case KEY_SPACE:
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

    private onChange(event: React.ChangeEvent<HTMLTextElement>): void {
        const { currentTarget: { value, selectionStart } } = event;

        const updates: Partial<TextInputState> = {
            value
        };

        if (this.props.autocomplete) {
            if (this.state.completionVisible) {
                let query = value.substring(0, selectionStart);
                const lastIdx = query.lastIndexOf('@');

                if (lastIdx > -1) {
                    query = query.substring(lastIdx + 1);
                }

                updates.query = query;
                updates.matches = filterOptions(this.state.options, query);
            } else {
                if (this.props.count === Count.SMS) {
                    const stats = getMsgStats(value, true);

                    updates.parts = stats.parts;
                    updates.characterCount = stats.characterCount;
                    updates.unicodeChars = stats.unicodeChars;
                }
            }

            updates.caretOffset = selectionStart;
            updates.selectedOptionIndex = 0;
        }

        this.setState(updates as TextInputState);

        if (this.props.onChange) {
            this.props.onChange(event);
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

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (!this.state.value) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors });

        // See if it should be a valid url
        if (errors.length === 0) {
            if (this.props.url) {
                if (!isValidURL(this.state.value)) {
                    errors.push('Enter a valid URL');
                }
            }
        }

        return errors.length === 0;
    }

    private focusInput(): void {
        const { value: { length } } = this.textEl;
        this.textEl.focus();
        this.textEl.selectionStart = length;
    }

    private getOption({ name, description }: CompletionOption, selected: boolean): JSX.Element {
        const optionName = <div data-spec="option-name">{name}</div>;

        if (selected) {
            return (
                <React.Fragment>
                    {optionName}
                    <div data-spec="option-desc" className={styles.option_description}>
                        {description}
                    </div>
                </React.Fragment>
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
                        key={option.name}
                    >
                        {this.getOption(option, true)}
                    </li>
                );
            }

            return (
                <li className={optionClasses.join(' ')} key={option.name}>
                    {this.getOption(option, false)}
                </li>
            );
        });
    }

    public render(): JSX.Element {
        const textElClasses = cx({
            [styles.textinput]: true,
            [shared.invalid]: this.state.errors.length > 0 || this.props.showInvalid === true
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
            this.state.errors.length > 0 &&
            this.props.name === 'Message' &&
            (this.props.typeConfig.type === Types.send_msg ||
                this.props.typeConfig.type === Types.send_broadcast);

        // Make sure we're rendering the right text element
        const TextElement = this.props.textarea ? 'textarea' : ('input' as string);
        const inputType = this.props.textarea ? undefined : 'text';
        return (
            <FormElement
                __className={this.props.__className}
                name={this.props.name}
                helpText={this.props.helpText}
                showLabel={this.props.showLabel}
                errors={this.state.errors}
                sendMsgError={sendMsgError}
            >
                <div className={styles.wrapper}>
                    <TextElement
                        data-spec="input"
                        ref={this.textElRef}
                        type={inputType}
                        className={textElClasses}
                        value={this.state.value}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                        onKeyDown={this.onKeyDown}
                        placeholder={this.props.placeholder}
                    />
                    <div
                        className={completionClasses}
                        style={this.state.caretCoordinates}
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

const mapStateToProps = ({
    flowContext: { resultNames },
    nodeEditor: { typeConfig }
}: AppState) => ({
    typeConfig,
    resultNames
});

const ConnectedTextInputElement = connect(mapStateToProps, null, null, { withRef: true })(
    TextInputElement
);

export default ConnectedTextInputElement;
