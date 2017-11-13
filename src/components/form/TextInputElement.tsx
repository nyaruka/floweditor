import * as React from 'react';
import { findDOMNode } from 'react-dom';
import FormElement, { FormElementProps } from './FormElement';
import ComponentMap, { CompletionOption } from '../../services/ComponentMap';

const getCaretCoordinates = require('textarea-caret');
const inputSelection = require('get-input-selection');

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

export interface Coordinates {
    left: number;
    top: number;
}

export interface HTMLTextElement {
    value: string;
    selectionStart: number;
}

interface TextInputProps extends FormElementProps {
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
    value: string;
    errors: string[];
    caretOffset: number;
    caretCoordinates: Coordinates;
    completionVisible: boolean;
    selectedOptionIdx: number;
    matches: CompletionOption[];
    query: string;
}

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

export default class TextInputElement extends React.Component<TextInputProps, TextInputState> {
    private selectedEle: any;
    private textElement: HTMLTextElement;
    private options: CompletionOption[];

    constructor(props: any) {
        super(props);

        this.state = {
            value: this.props.value ? this.props.value : '',
            caretOffset: 0,
            caretCoordinates: { left: 0, top: 0 },
            errors: [],
            completionVisible: false,
            selectedOptionIdx: 0,
            matches: [],
            query: ''
        };

        if (this.props.autocomplete) {
            this.options = [...OPTIONS, ...this.props.ComponentMap.getResultNames()] as any;
        }

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    private setSelection(selectedIdx: number) {
        let idx: number;

        /** Can't exceed the last option */
        if (selectedIdx >= this.state.matches.length) {
            idx = this.state.matches.length - 1;
        }

        /** Can't go beyond the first option */
        if (selectedIdx < 0) {
            idx = 0;
        }

        if (selectedIdx !== this.state.selectedOptionIdx) {
            this.setState({ selectedOptionIdx: idx });
        }
    }

    private onKeyDown(event: React.KeyboardEvent<HTMLTextElement>) {
        if (!this.props.autocomplete) {
            return;
        }

        let ele: any;
        let query: string = '';
        let matches: CompletionOption[] = [];
        let completionVisible = matches.length > 0;

        const { value: currentValue, caretOffset, query: { length: queryLength } } = this.state;

        switch (event.keyCode) {
            case KEY_P:
                if (!event.ctrlKey) {
                    break;
                }
            case KEY_UP:
                if (this.state.completionVisible) {
                    this.setSelection(this.state.selectedOptionIdx - 1);
                    event.preventDefault();
                }
                break;

            case KEY_N:
                if (!event.ctrlKey) {
                    break;
                }
            case KEY_DOWN:
                if (this.state.completionVisible) {
                    this.setSelection(this.state.selectedOptionIdx + 1);
                    event.preventDefault();
                }
                break;
            case KEY_AT:
                ele = findDOMNode(this.textElement as any);
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
                    const { name: optionName } = this.state.matches[this.state.selectedOptionIdx];

                    const newValue =
                        currentValue.substr(0, caretOffset - queryLength) +
                        optionName +
                        currentValue.substr(caretOffset);

                    const { length: newCaretOffset } = newValue;

                    if (event.keyCode === KEY_TAB) {
                        query = optionName;
                        matches = this.filterOptions(query);
                    }

                    this.setState(
                        {
                            query,
                            value: newValue,
                            matches,
                            caretOffset: newCaretOffset,
                            completionVisible,
                            selectedOptionIdx: 0
                        },
                        () => {
                            inputSelection.setCaretPosition(
                                findDOMNode(this.textElement as any),
                                newCaretOffset
                            );
                        }
                    );

                    /** TODO: set caret position */
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;

            case KEY_BACKSPACE:
                const carretOffset = event.currentTarget.selectionStart - 1;

                /** Iterate backwards on our value until we reach either a space or @ */
                for (let i = carretOffset - 1; i >= 0; i--) {
                    let curr = currentValue[i];

                    /** Space, don't do anything but break out */
                    if (curr === ' ') {
                        break;
                    }

                    /** If @ we display autocompletion again */
                    if (curr === '@') {
                        ele = findDOMNode(this.textElement as any);
                        query = currentValue.substr(i + 1, carretOffset - i - 1);
                        matches = this.filterOptions(query);
                        completionVisible = matches.length > 0;

                        return this.setState({
                            query,
                            matches,
                            value: currentValue,
                            caretOffset,
                            completionVisible,
                            selectedOptionIdx: 0,
                            caretCoordinates: getCaretCoordinates(ele, i)
                        });
                    }
                }

                /** Completion is still visible but really shouldn't be, clear it out */
                if (this.state.completionVisible) {
                    return this.setState({
                        query: '',
                        matches: [],
                        value: this.state.value,
                        caretOffset,
                        completionVisible: false,
                        selectedOptionIdx: 0
                    });
                }
                break;
            case KEY_SPACE:
                return this.setState({
                    completionVisible: false
                });
        }
    }

    private onBlur(event: React.ChangeEvent<HTMLTextElement>) {
        this.setState(
            {
                query: '',
                matches: [],
                value: this.state.value,
                caretOffset: 0,
                selectedOptionIdx: 0,
                completionVisible: false
            },
            () => this.props.onBlur && this.props.onBlur(event)
        );
    }

    private onChange(event: React.ChangeEvent<HTMLTextElement>) {
        const { currentTarget: { selectionStart, value } } = event;
        const { completionVisible }  = this.state;

        if (this.props.autocomplete) {
            let query: string;
            let matches: CompletionOption[] = [];

            if (completionVisible) {
                query = value.substring(0, selectionStart);

                let lastIdx = query.lastIndexOf('@');

                if (lastIdx > -1) {
                    query = query.substring(lastIdx + 1);
                }

                matches = this.filterOptions(query);
            }

            this.setState({
                caretOffset: selectionStart,
                matches,
                selectedOptionIdx: 0,
                value,
                query
            });
        } else {
            this.setState({
                value
            });
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

        // see if it should be a valid url
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
        if (query) {
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
        if (this.selectedEle) {
            const selectedOption = findDOMNode(this.selectedEle);
            if (selectedOption) {
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

            if (index === this.state.selectedOptionIdx) {
                optionClasses = [...optionClasses, styles.selected];

                if (index === 0) {
                    optionClasses = [...optionClasses, styles.first_options];
                }

                return (
                    <li
                        ref={ele => {
                            this.selectedEle = ele;
                        }}
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

        return (
            <FormElement
                className={this.props.className}
                name={this.props.name}
                helpText={this.props.helpText}
                showLabel={this.props.showLabel}
                errors={this.state.errors}>
                <div className={styles.wrapper}>
                    <TextElement
                        ref={(ref: any) => (this.textElement = ref)}
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
            </FormElement>
        );
    }
};
