import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { byteLength } from '../../helpers/utils';
import FormElement, { FormElementProps } from './FormElement';
import ComponentMap, { CompletionOption } from '../../services/ComponentMap';

const getCaretCoordinates = require('textarea-caret');
const { setCaretPosition } = require('get-input-selection');

const styles = require('./TextInputElement.scss');
const shared = require('./FormElement.scss');

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

const OPTIONS: CompletionOption[] = [
    { name: 'contact', description: 'The name of the contact.' },
    { name: 'contact.name', description: 'The name of the contact.' },
    { name: 'contact.language', description: 'The language code for the contact.' },
    { name: 'contact.fields', description: 'Custom fields on the contact.' },
    { name: 'contact.groups', description: 'The groups for the contact.' },
    { name: 'contact.urns', description: 'URNs on the contact.' },
    { name: 'contact.urns.tel', description: 'The preferred telephone number for the contact.' },
    { name: 'contact.urns.telegram', description: 'The preferred telegram id for the contact.' },
    { name: 'input', description: 'The last input from the contact if any.' },
    { name: 'run', description: 'Run details' },
    { name: 'run.contact', description: 'The contact in this run' },
    { name: 'run.results', description: 'Results for the run' },
    { name: 'child', description: 'Run details after running a child flow' },
    { name: 'child.results', description: 'The results for the child flow' },
    { name: 'parent', description: 'Run details if being called from a parent flow' },
    { name: 'parent.results', description: 'The results for the parent flow' },
    { name: 'webhook', description: 'The body of the webhook response' },
    { name: 'webhook.status', description: 'The status of the webhook call' },
    { name: 'webhook.status_code', description: 'The status code returned from the webhook' },
    { name: 'webhook.url', description: 'The URL which was called' },
    { name: 'webhook.body', description: 'The body of the webhook response' },
    {
        name: 'webhook.json',
        description: 'The JSON parsed body of the response, can access subelements'
    },
    { name: 'webhook.request', description: 'The raw request of the webhook including headers' },
    { name: 'webhook.response', description: 'The raw response of the webhook including headers' }
];

const CHARSET_7_BIT: { [key: string]: boolean } = {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    '@': true,
    'Â£': true,
    $: true,
    'Â¥': true,
    'Ã¨': true,
    'Ã©': true,
    'Ã¹': true,
    'Ã¬': true,
    'Ã²': true,
    'Ã‡': true,
    '\n': true,
    'Ã˜': true,
    'Ã¸': true,
    '\r': true,
    'Ã…': true,
    'Ã¥': true,
    'Î”': true,
    _: true,
    'Î¦': true,
    'Î“': true,
    'Î›': true,
    'Î©': true,
    'Î ': true,
    'Î¨': true,
    'Î£': true,
    'Î˜': true,
    Îž: true,
    'Ã†': true,
    'Ã¦': true,
    ÃŸ: true,
    'Ã‰': true,
    ' ': true,
    '!': true,
    '"': true,
    '#': true,
    'Â¤': true,
    '%': true,
    '&': true,
    "'": true,
    '(': true,
    ')': true,
    '*': true,
    '+': true,
    ',': true,
    '-': true,
    '.': true,
    '/': true,
    ':': true,
    ';': true,
    '<': true,
    '=': true,
    '>': true,
    '?': true,
    'Â¡': true,
    A: true,
    B: true,
    C: true,
    D: true,
    E: true,
    F: true,
    G: true,
    H: true,
    I: true,
    J: true,
    K: true,
    L: true,
    M: true,
    N: true,
    O: true,
    P: true,
    Q: true,
    R: true,
    S: true,
    T: true,
    U: true,
    V: true,
    W: true,
    X: true,
    Y: true,
    Z: true,
    'Ã„': true,
    'Ã–': true,
    'Ã‘': true,
    Ãœ: true,
    'Â§': true,
    'Â¿': true,
    a: true,
    b: true,
    c: true,
    d: true,
    e: true,
    f: true,
    g: true,
    h: true,
    i: true,
    j: true,
    k: true,
    l: true,
    m: true,
    n: true,
    o: true,
    p: true,
    q: true,
    r: true,
    s: true,
    t: true,
    u: true,
    v: true,
    w: true,
    x: true,
    y: true,
    z: true,
    'Ã¤': true,
    'Ã¶': true,
    'Ã±': true,
    'Ã¼': true,
    'Ã ': true
};

const CHARSET_7_BIT_TEXT: { [key: string]: boolean } = {
    '\f': true,
    '^': true,
    '{': true,
    '}': true,
    '\\': true,
    '[': true,
    '~': true,
    ']': true,
    '|': true,
    'â‚¬': true
};

export const MAX_GSM_SINGLE = 160;
export const MAX_GSM_MULTI = 153;
export const MAX_UNICODE_SINGLE = 70;
export const MAX_UNICODE_MULTI = 67;

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
}

interface TextInputProps extends FormElementProps {
    count?: Count;
    value: string;
    /** Validates that the input is a url */
    url?: boolean;
    /** Should we display in a textarea */
    textarea?: boolean;
    /** Text to display when there is no value */
    placeholder?: string;
    /** Do we show autocompletion choices */
    autocomplete?: boolean;
    onChange?(event: React.ChangeEvent<HTMLTextElement>): void;
    onBlur?(event: React.ChangeEvent<HTMLTextElement>): void;
    ComponentMap: ComponentMap;
}

export interface TextInputState {
    max: number;
    segments: number;
    unicode: boolean;
    value: string;
    errors: string[];
    caretOffset: number;
    caretCoordinates: Coordinates;
    completionVisible: boolean;
    selectedOptionIndex: number;
    matches: CompletionOption[];
    query: string;
}

export default class TextInputElement extends React.Component<TextInputProps, TextInputState> {
    private selectedEl: any;
    private textEl: HTMLTextElement;
    private options: CompletionOption[];

    constructor(props: any) {
        super(props);

        const { max, unicode, segments } = this.getCount(this.props.value);

        this.state = {
            max,
            unicode,
            segments,
            value: this.props.value ? this.props.value : '',
            caretOffset: 0,
            caretCoordinates: { left: 0, top: 0 },
            errors: [],
            completionVisible: false,
            selectedOptionIndex: 0,
            matches: [],
            query: ''
        };

        if (this.props.autocomplete) {
            this.options = [...OPTIONS, ...this.props.ComponentMap.getResultNames()] as any;
        }

        this.selectedElRef = this.selectedElRef.bind(this);
        this.textElRef = this.textElRef.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    private selectedElRef(ref: any) {
        return (this.selectedEl = ref);
    }

    private textElRef(ref: any) {
        return (this.textEl = ref);
    }

    private getCount(value: string) {
        let max: number;
        let segments: number;
        let remaining: number;

        let unicode: boolean = false;
        let doubleChar: boolean = false;
        let chars = 0;
        let segChars = 0;
        let segment: number = 1;

        /** Determine base encoding */
        for (const char of value) {
            if (CHARSET_7_BIT[char]) {
                chars += 1;
            } else if (CHARSET_7_BIT_TEXT[char]) {
                chars += 2;
            } else {
                unicode = true;
                ({ length: chars } = value);
                break;
            }
        }

        if (unicode) {
            max = MAX_UNICODE_SINGLE;

            if (chars > MAX_UNICODE_SINGLE) {
                max = MAX_UNICODE_MULTI;
            }

            segments = Math.ceil(chars / max);

            for (const char of value) {
                /** Calculate segment/segChars based on whether character is more than 3 UTF-8 bytes */
                doubleChar = byteLength(char) > 3;

                if (segChars + 1 > max) {
                    segment += 1;
                    segChars = 0;
                }

                if (doubleChar && segChars + 2 > max) {
                    segment += 1;
                    segChars = 0;
                }

                if (doubleChar) {
                    segChars += 2;
                } else {
                    segChars += 1;
                }
            }
        } else {
            max = MAX_GSM_SINGLE;

            if (chars > MAX_GSM_SINGLE) {
                max = MAX_GSM_MULTI;
            }

            segments = Math.ceil(chars / max);

            for (const char of value) {
                /** Calculate segment/segChars based on whether character is 7 or 14 bits */
                doubleChar = CHARSET_7_BIT_TEXT[char];

                if (segChars + 1 > MAX_GSM_SINGLE) {
                    segment += 1;
                    segChars = 0;
                }

                if (doubleChar && segChars + 2 > MAX_GSM_SINGLE) {
                    segment += 1;
                    segChars = 0;
                }

                if (doubleChar) {
                    segChars += 2;
                } else {
                    segChars += 1;
                }
            }
        }

        remaining = segments * max - chars;

        return {
            max,
            unicode,
            segments
        };
    }

    private setSelection(selectedIdx: number) {
        /** Can't exceed the last option */
        if (selectedIdx >= this.state.matches.length) {
            selectedIdx = this.state.matches.length - 1;
        }

        /** Can't go beyond the first option */
        if (selectedIdx < 0) {
            selectedIdx = 0;
        }

        if (selectedIdx !== this.state.selectedOptionIndex) {
            this.setState({ selectedOptionIndex: selectedIdx });
        }
    }

    private onPaste(event: React.ClipboardEvent<string>): void {
        event.clipboardData.items[0].getAsString(() => {
            const commonUnicodeReplaced = this.state.value
                .replace(/[\u2018\u2019]/g, "'")
                .replace(/[\u201C\u201D]/g, '"')
                .replace(/[\u2013\u2014]/g, '-')
                .replace(/\u2026/g, '...');

            const newCount = this.getCount(commonUnicodeReplaced);

            this.setState({
                value: commonUnicodeReplaced,
                ...newCount
            });
        });
    }

    private onKeyUp(event: React.KeyboardEvent<HTMLTextElement>): void {
        if (!this.state.completionVisible) {
            const newCount = this.getCount(this.state.value);
            this.setState(newCount);
        }
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
                var ele: any = findDOMNode(this.textEl as any);

                this.setState({
                    completionVisible: true,
                    caretCoordinates: getCaretCoordinates(ele, ele.selectionEnd)
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
                        matches = this.filterOptions(query);
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
                            setCaretPosition(findDOMNode(this.textEl as any), newCaret);
                        }
                    );

                    /** TODO: set caret position */
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case KEY_BACKSPACE:
                /** Iterate backwards on our value until we reach either a space or @ */
                var caret = event.currentTarget.selectionStart - 1;
                for (let i = caret - 1; i >= 0; i--) {
                    const curr = this.state.value[i];
                    /** Space, don't do anything but break out */
                    if (curr === ' ') {
                        break;
                    }

                    /** @ we display again **/
                    if (curr === '@') {
                        var ele: any = findDOMNode(this.textEl as any);
                        query = this.state.value.substr(i + 1, caret - i - 1);
                        matches = this.filterOptions(query);
                        completionVisible = matches.length > 0;
                        this.setState({
                            query,
                            matches,
                            value: this.state.value,
                            caretOffset: caret,
                            completionVisible,
                            selectedOptionIndex: 0,
                            caretCoordinates: getCaretCoordinates(ele, i)
                        });
                        return;
                    }
                }

                /** We are visible still but really shouldn't be, clear out **/
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

    private onBlur(event: React.ChangeEvent<HTMLTextElement>) {
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

    private onChange(event: React.ChangeEvent<HTMLTextElement>) {
        const { currentTarget: { value: text, selectionStart } } = event;

        let update: any = {
            value: text
        };

        if (this.props.autocomplete) {
            let query: string = null;
            let matches: CompletionOption[] = [];

            if (this.state.completionVisible) {
                query = text.substring(0, selectionStart);
                const lastIdx = query.lastIndexOf('@');

                if (lastIdx > -1) {
                    query = query.substring(lastIdx + 1);
                }

                matches = this.filterOptions(query);
            }

            update = {
                ...update,
                caretOffset: selectionStart,
                matches,
                selectedOptionIndex: 0,
                value: text,
                query
            } as TextInputState;
        }

        this.setState(update);

        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    private isValidURL(string: string) {
        const pattern = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/; // fragment locater
        return pattern.test(string);
    }

    validate(): boolean {
        let errors: string[] = [];

        if (this.props.required) {
            if (!this.state.value) {
                errors = [...errors, `${this.props.name} is required`];
            }
        }

        this.setState({ errors });

        /** See if it should be a valid url */
        if (errors.length === 0) {
            if (this.props.url) {
                if (!this.isValidURL(this.state.value)) {
                    errors = [...errors, 'Enter a valid URL'];
                }
            }
        }

        return errors.length === 0;
    }

    private filterOptions(query: string): CompletionOption[] {
        if (query !== null) {
            const search = query.toLowerCase();
            const results = this.options.filter(({ name: optionName }: CompletionOption) => {
                const rest = optionName.substr(search.length);
                return (
                    optionName.indexOf(search) === 0 &&
                    (rest.length === 0 || rest.substr(1).indexOf('.') === -1)
                );
            });
            return results;
        }
        return [];
    }

    private getOptionName(query: string, option: CompletionOption): string {
        return option.name;
    }

    componentDidUpdate(previous: TextInputProps) {
        if (this.selectedEl !== null) {
            const selectedOption = findDOMNode(this.selectedEl);
            if (selectedOption !== null) {
                selectedOption.scrollIntoView(false);
            }
        }
    }

    private renderOption({ name, description }: CompletionOption, selected: boolean): JSX.Element {
        if (selected) {
            return (
                <div>
                    <div className={styles.option_name}>{name}</div>
                    <div className={styles.option_description}>{description}</div>
                </div>
            );
        }
        return <div className={styles.option_name}>{name}</div>;
    }

    render() {
        let classes: string[] = [styles.textinput];

        if (this.state.errors.length > 0) {
            classes = [...classes, shared.invalid];
        }

        let completionClasses: string[] = [styles.completion_container];

        if (!this.state.completionVisible || this.state.matches.length === 0) {
            completionClasses = [...completionClasses, styles.hidden];
        }

        const options = this.state.matches.map((option: CompletionOption, index: number) => {
            let optionClasses = [styles.option];

            if (index === this.state.selectedOptionIndex) {
                optionClasses = [...optionClasses, styles.selected];

                if (index === 0) {
                    optionClasses = [...optionClasses, styles.first_options];
                }

                return (
                    <li
                        ref={this.selectedElRef}
                        className={optionClasses.join(' ')}
                        key={option.name}>
                        {this.renderOption(option, true)}
                    </li>
                );
            }
            return (
                <li className={optionClasses.join(' ')} key={option.name}>
                    {this.renderOption(option, false)}
                </li>
            );
        });

        /** Use the proper form element */
        let TextElement = 'input';

        if (this.props.textarea) {
            TextElement = 'textarea';
        }

        let counter: JSX.Element = null;

        if (this.props.count === Count.SMS) {
            const { unicode, max, segments, value: { length: chars } } = this.state;
            const encoding = unicode ? 'Unicode' : '7-bit';

            counter = (
                <div className={styles.count} data-spec="counter">
                    <div>
                        {chars}/{segments}{' '}
                        <span className={styles.tooltip}>
                            <b>&#63;</b>
                            <span className={styles.tooltiptext}>
                                <div>
                                    <b>Encoding</b>
                                    {`  ${encoding}`}
                                </div>
                                <div>
                                    <b>Segments</b>
                                    {`  ${segments}`}
                                </div>
                                <div>
                                    <b>Character Count</b>
                                    {`  ${chars}`}
                                </div>
                                <div>
                                    <b>Limit Per Segment</b>
                                    {`  ${max}`}
                                </div>
                            </span>
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <FormElement
                className={this.props.className}
                name={this.props.name}
                helpText={this.props.helpText}
                showLabel={this.props.showLabel}
                errors={this.state.errors}>
                <div className={styles.wrapper}>
                    <TextElement
                        ref={this.textElRef}
                        className={classes.join(' ')}
                        value={this.state.value}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                        onKeyDown={this.onKeyDown}
                        onKeyUp={this.onKeyUp}
                        onPaste={this.onPaste}
                        placeholder={this.props.placeholder}
                    />
                    <div
                        style={this.state.caretCoordinates}
                        className={completionClasses.join(' ')}>
                        <ul className={styles.option_list}>{options}</ul>
                        <div className={styles.help}>Tab to complete, enter to select</div>
                    </div>
                </div>
                {counter}
            </FormElement>
        );
    }
}
