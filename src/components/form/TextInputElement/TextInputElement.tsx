import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { toCharSetEnum, replacePastedUnicode } from '../../../helpers/utils';
import ComponentMap, { CompletionOption } from '../../../services/ComponentMap';
import FormElement, { FormElementProps } from '../FormElement';
import { OPTIONS } from './completion-options';

const getCaretCoordinates = require('textarea-caret');
const { setCaretPosition } = require('get-input-selection');
const { split } = require('split-sms');

const styles = require('./TextInputElement.scss');
const shared = require('../FormElement.scss');

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

export enum Count {
    SMS = 'SMS'
}

export enum CharacterSet {
    GSM = 'GSM',
    UNICODE = 'UNICODE'
}

export interface Coordinates {
    left: number;
    top: number;
}

export interface HTMLTextElement {
    value: string;
    selectionStart: number;
    focus(): void;
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
    focus?: boolean;
    onChange?(event: React.ChangeEvent<HTMLTextElement>): void;
    onBlur?(event: React.ChangeEvent<HTMLTextElement>): void;
    ComponentMap: ComponentMap;
}

export interface TextInputState {
    maxLength: number;
    parts: string[];
    characterCount: number;
    characterSet: CharacterSet;
    remainingInPart: number;
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

        const { value } = this.props;

        const {
            maxLength,
            characterSet,
            remainingInPart,
            parts,
            characterCount
        } = this.getCharCount(value);

        this.state = {
            maxLength,
            characterSet,
            parts,
            characterCount,
            remainingInPart,
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
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    private selectedElRef(ref: any) {
        return (this.selectedEl = ref);
    }

    private textElRef(ref: any) {
        return (this.textEl = ref);
    }

    /**
     * First pass at providing the user with an accurate character count for their SMS messages.
     * Determines encoding, segments, max character limit per message and calculates character count.
     * Optionally replaces common unicode 'gotcha characters' with their GSM counterparts.
     * @param value
     * @param replace
     */
    private getCharCount(
        value: string,
        replace?: boolean
    ): {
        maxLength: number;
        parts: string[];
        characterSet: CharacterSet;
        characterCount: number;
        remainingInPart: number;
        value: string;
    } {
        if (replace) {
            value = replacePastedUnicode(value);
        }

        let { length: characterCount, remainingInPart, characterSet, parts } = split(value);

        characterSet = toCharSetEnum(characterSet);

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
            value
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
        let { currentTarget: { value, selectionStart } } = event;

        if (this.props.autocomplete) {
            let updates: any = {
                value
            };
            let query: string = null;
            let matches: CompletionOption[] = [];

            if (this.state.completionVisible) {
                query = value.substring(0, selectionStart);
                const lastIdx = query.lastIndexOf('@');

                if (lastIdx > -1) {
                    query = query.substring(lastIdx + 1);
                }

                matches = this.filterOptions(query);

                updates = {
                    ...updates,
                    query,
                    matches
                };
            } else {
                updates = {
                    ...updates,
                    ...this.getCharCount(value, true)
                };
            }

            updates = {
                ...updates,
                caretOffset: selectionStart,
                selectedOptionIndex: 0
            } as TextInputState;

            this.setState(updates);
        }

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

    public componentDidMount(): void {
        this.props.focus && this.textEl.focus();
    }

    public componentDidUpdate(previous: TextInputProps): void {
        if (this.selectedEl !== null) {
            const selectedOption = findDOMNode(this.selectedEl);
            if (selectedOption !== null) {
                selectedOption.scrollIntoView(false);
            }
        }
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
            const { remainingInPart, characterSet, maxLength, parts, characterCount } = this.state;

            counter = (
                <div className={styles.count} data-spec="counter">
                    <div>
                        {remainingInPart}/{parts.length}{' '}
                        <span className={styles.tooltip}>
                            <b>&#63;</b>
                            <span className={styles.tooltiptext}>
                                <div>
                                    <b>Encoding</b>
                                    {`  ${characterSet}`}
                                </div>
                                <div>
                                    <b>Parts</b>
                                    {`  ${parts.length}`}
                                </div>
                                <div>
                                    <b>Characters</b>
                                    {`  ${characterCount}`}
                                </div>
                                <div>
                                    <b>Limit Per Part</b>
                                    {`  ${maxLength}`}
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
