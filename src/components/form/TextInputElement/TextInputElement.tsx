import * as React from 'react';
import getCaretCoordinates from 'textarea-caret';
import setCaretPosition from 'get-input-selection';
import { split } from 'split-sms';
import ComponentMap, { CompletionOption } from '../../../services/ComponentMap';
import FormElement, { FormElementProps } from '../FormElement';
import { OPTIONS } from './completionOptions';

import * as styles from './TextInputElement.scss';
import * as shared from '../FormElement.scss';

export enum Count {
    SMS = 'SMS'
}

export enum CharacterSet {
    GSM = 'GSM',
    UNICODE = 'Unicode'
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

interface CharCountStats {
    maxLength: number;
    parts: string[];
    characterSet: CharacterSet;
    characterCount: number;
    remainingInPart: number;
    value: string;
}

interface TextInputProps extends FormElementProps {
    value: string;
    ComponentMap: ComponentMap;
    count?: Count;
    url?: boolean;
    textarea?: boolean;
    placeholder?: string;
    autocomplete?: boolean;
    focus?: boolean;
    onChange?(event: React.ChangeEvent<HTMLTextElement>): void;
    onBlur?(event: React.ChangeEvent<HTMLTextElement>): void;
}

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
    maxLength?: number;
    parts?: string[];
    characterCount?: number;
    characterSet?: CharacterSet;
    remainingInPart?: number;
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

const KEY_AT = 50;
const KEY_SPACE = 32;
const KEY_ENTER = 13;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_TAB = 9;
const KEY_P = 80;
const KEY_N = 78;
const KEY_ESC = 27;
const KEY_BACKSPACE = 8;

export const MAX_GSM_SINGLE = 160;
export const MAX_GSM_MULTI = 153;
export const MAX_UNICODE_SINGLE = 70;
export const MAX_UNICODE_MULTI = 67;

/**
 * Replaces unicode characters commonly inserted by text editors like MSWord in a given string with their GSM equivalents
 * @param {string} msg - msg to be cleaned
 * @returns {string} Cleaned msg
 */
export const cleanMsg = (msg: string): string =>
    msg
        .replace(/[\u2018\u2019]/g, "'") /** Smart single quotes */
        .replace(/[\u201C\u201D]/g, '"') /** Smart double quotes */
        .replace(/[\u2013\u2014]/g, '-') /** En/em dash */
        .replace(/\u2026/g, '...') /** Horizontal ellipsis */
        .replace(/\u2002/g, ' '); /** En space */

/**
 * First pass at providing the user with an accurate character count for their SMS messages.
 * Determines encoding, segments, max character limit per message and calculates character count.
 * Optionally replaces common unicode 'gotcha characters' with their GSM counterparts.
 * @param value
 * @param replace
 */
export const getCharCount = (value: string | string[], replace?: boolean): CharCountStats => {
    let newVal = value as string;

    // Localized values are stored as string arrays
    if (newVal.constructor === Array) {
        newVal = newVal[0];
    }

    if (replace) {
        newVal = cleanMsg(newVal);
    }

    // prettier-ignore
    const {
        length: characterCount,
        remainingInPart,
        characterSet,
        parts
    } = split(newVal);

    let maxLength: number = MAX_GSM_SINGLE;

    if (characterSet === CharacterSet.UNICODE) {
        if (characterCount > MAX_UNICODE_SINGLE) {
            maxLength = MAX_UNICODE_MULTI;
        } else {
            maxLength = MAX_UNICODE_SINGLE;
        }
    } else {
        if (characterCount > MAX_GSM_SINGLE) {
            maxLength = MAX_GSM_MULTI;
        }
    }

    return {
        maxLength,
        parts,
        characterCount,
        remainingInPart,
        characterSet,
        value: newVal
    };
};

export const getCharCountStats = (count: Count, value: string = ''): CharCountStats | {} =>
    count && count === Count.SMS ? getCharCount(value) : {};

const isValidURL = (str: string): boolean => {
    // Courtesy of @diegoperini: https://gist.github.com/dperini/729294
    // Expected behavior: https://mathiasbynens.be/demo/url-regex
    const webURLRegex = new RegExp(
        '^' +
            // protocol identifier
            '(?:(?:https?|ftp)://)' +
            // user:pass authentication
            '(?:\\S+(?::\\S*)?@)?' +
            '(?:' +
            // IP address exclusion
            // private & local networks
            '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
            '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
            '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
            '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
            '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
            '|' +
            // host name
            '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
            // domain name
            '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
            // TLD identifier
            '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
            // TLD may end with dot
            '\\.?' +
            ')' +
            // port number
            '(?::\\d{2,5})?' +
            // resource path
            '(?:[/?#]\\S*)?' +
            '$',
        'i'
    );

    return webURLRegex.test(str);
};

export const filterOptions = (options: CompletionOption[], query?: string): CompletionOption[] => {
    if (query != null) {
        const search = query.toLowerCase();

        return options.filter(({ name: optionName }: CompletionOption) => {
            const rest = optionName.substr(search.length);

            return (
                optionName.indexOf(search) === 0 &&
                (rest.length === 0 || rest.substr(1).indexOf('.') === -1)
            );
        });
    }

    return [];
};

export const getOptionsList = (
    autocomplete: boolean,
    { getResultNames }: ComponentMap
): CompletionOption[] => (autocomplete ? [...OPTIONS, ...getResultNames()] : OPTIONS);

const initialState: InitialState = {
    caretOffset: 0,
    caretCoordinates: { left: 0, top: 0 },
    errors: [],
    completionVisible: false,
    selectedOptionIndex: 0,
    matches: [],
    query: ''
};

export default class TextInputElement extends React.Component<TextInputProps, TextInputState> {
    private selectedEl: HTMLLIElement;
    private textEl: HTMLTextElement;

    constructor(props: TextInputProps) {
        super(props);

        this.state = {
            value: this.props.value,
            options: getOptionsList(this.props.autocomplete, this.props.ComponentMap),
            ...initialState,
            ...getCharCountStats(this.props.count, this.props.value)
        };

        this.selectedElRef = this.selectedElRef.bind(this);
        this.textElRef = this.textElRef.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
        this.setSelection = this.setSelection.bind(this);
        this.validate = this.validate.bind(this);
    }

    private selectedElRef(ref: HTMLLIElement): HTMLLIElement {
        return (this.selectedEl = ref);
    }

    private textElRef(ref: HTMLTextElement): HTMLTextElement {
        return (this.textEl = ref);
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
                    var option = this.state.matches[this.state.selectedOptionIndex];
                    var newValue = this.state.value.substr(
                        0,
                        this.state.caretOffset - this.state.query.length
                    );
                    newValue += option.name;

                    var newCaret = newValue.length;
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
                var caret = event.currentTarget.selectionStart - 1;
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
                            value: this.state.value,
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
                        value: this.state.value,
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
                value: this.state.value,
                caretOffset: 0,
                selectedOptionIndex: 0,
                completionVisible: false
            },
            () => this.props.onBlur && this.props.onBlur(event)
        );
    }

    private onChange(event: React.ChangeEvent<HTMLTextElement>): void {
        const { currentTarget: { value, selectionStart } } = event;

        const updates: any = {
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
                    const {
                        maxLength,
                        characterSet,
                        remainingInPart,
                        parts,
                        characterCount
                    } = getCharCount(value, true);

                    updates.maxLength = maxLength;
                    updates.characterSet = characterSet;
                    updates.remainingInPart = remainingInPart;
                    updates.parts = parts;
                    updates.characterCount = characterCount;
                }
            }

            updates.caretOffset = selectionStart;
            updates.selectedOptionIndex = 0;
        }

        this.setState(updates);

        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    private setSelection(selectedIdx: number): void {
        let selectedOptionIndex: number = selectedIdx;

        /** Can't exceed the last option */
        if (selectedIdx >= this.state.matches.length) {
            selectedOptionIndex = this.state.matches.length - 1;
        }

        /** Can't go beyond the first option */
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

        /** See if it should be a valid url */
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
        if (selected) {
            return (
                <div>
                    <div data-spec="option-name">{name}</div>
                    <div data-spec="option-desc" className={styles.option_description}>
                        {description}
                    </div>
                </div>
            );
        }
        return <div data-spec="option-name">{name}</div>;
    }

    private getOptions(): JSX.Element[] {
        return this.state.matches.map((option: CompletionOption, idx: number) => {
            const optionClasses: string[] = [styles.option];

            if (idx === this.state.selectedOptionIndex) {
                optionClasses.push(styles.selected);

                if (idx === 0) {
                    optionClasses.push(styles.first_option);
                }

                return (
                    <li
                        ref={this.selectedElRef}
                        className={optionClasses.join(' ')}
                        key={option.name}>
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

    private getCharCountEle(): JSX.Element {
        if (this.props.count && this.props.count === Count.SMS) {
            return (
                <div className={styles.count} data-spec="counter">
                    <div>
                        {this.state.remainingInPart}/{this.state.parts.length}{' '}
                        <span className={`${styles.tooltip}`}>
                            <b>&#63;</b>
                            <span className={styles.tooltiptext}>
                                <div className={styles.tooltiprow}>
                                    <b>Encoding</b>
                                    <span>{`  ${this.state.characterSet}`}</span>
                                </div>
                                <div className={styles.tooltiprow}>
                                    <b>Parts</b>
                                    <span>{`  ${this.state.parts.length}`}</span>
                                </div>
                                <div className={styles.tooltiprow}>
                                    <b>Characters</b>
                                    <span>{`  ${this.state.characterCount}`}</span>
                                </div>
                                <div className={styles.tooltiprow}>
                                    <b>Limit Per Part</b>
                                    <span>{`  ${this.state.maxLength}`}</span>
                                </div>
                            </span>
                        </span>
                    </div>
                </div>
            );
        }

        return null;
    }

    public render(): JSX.Element {
        const classes: string[] = [styles.textinput, this.state.errors.length > 0 && 'invalid'];

        const completionClasses: string[] = [
            styles.completion_container,
            (!this.state.completionVisible || this.state.matches.length === 0) && styles.hidden
        ];

        const options: JSX.Element[] = this.getOptions();

        const charCount: JSX.Element = this.getCharCountEle();

        // Make sure we're rendering the right text element
        const TextElement: string = this.props.textarea ? 'textarea' : 'input';

        const inputType: string = this.props.textarea ? undefined : 'text';

        return (
            <FormElement
                className={this.props.className}
                name={this.props.name}
                helpText={this.props.helpText}
                showLabel={this.props.showLabel}
                errors={this.state.errors}>
                <div className={styles.wrapper}>
                    <TextElement
                        data-spec="input"
                        ref={this.textElRef}
                        type={inputType}
                        className={classes.join(' ')}
                        value={this.state.value}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                        onKeyDown={this.onKeyDown}
                        placeholder={this.props.placeholder}
                    />
                    <div
                        style={this.state.caretCoordinates}
                        className={completionClasses.join(' ')}>
                        <ul className={styles.option_list}>{options}</ul>
                        <div className={styles.help}>Tab to complete, enter to select</div>
                    </div>
                </div>
                {charCount}
            </FormElement>
        );
    }
}
