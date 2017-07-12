import * as React from "react";
import * as ReactDOM from "react-dom";

import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormValueState } from './FormWidget';
import { ComponentMap, CompletionOption } from "../ComponentMap";

var getCaretCoordinates = require('textarea-caret');
var inputSelection = require('get-input-selection');

var styles = require("./TextInputElement.scss");
var shared = require("./FormElement.scss");

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
    left: number,
    top: number
}

export interface HTMLTextElement {
    value: string;
    selectionStart: number;
}

interface TextInputProps extends FormElementProps {
    value: string;

    // validates that the input is a url
    url?: boolean;

    // should we display in a textarea
    textarea?: boolean;

    // text to display when there is no value
    placeholder?: string;

    // do we show autocompletion choices
    autocomplete?: boolean;

    onChange?(event: React.ChangeEvent<HTMLTextElement>): void;
    onBlur?(event: React.ChangeEvent<HTMLTextElement>): void;
}

export interface TextInputState extends FormValueState {
    caretOffset: number;
    caretCoordinates: Coordinates;
    completionVisible: boolean;
    selectedOptionIndex: number;
    matches: CompletionOption[];
    query: string;
}

const OPTIONS: CompletionOption[] = [
    { name: "contact", description: "The name of the contact." },
    { name: "contact.name", description: "The name of the contact." },
    { name: "contact.language", description: "The language code for the contact." },
    { name: "contact.fields", description: "Custom fields on the contact." },
    { name: "contact.groups", description: "The groups for the contact." },
    { name: "contact.urns", description: "URNs on the contact." },
    { name: "contact.urns.tel", description: "The preferred telephone number for the contact." },
    { name: "contact.urns.telegram", description: "The preferred telegram id for the contact." },
    { name: "input", description: "The last input from the contact if any." },
    { name: "run", description: "Run details" },
    { name: "run.contact", description: "The contact in this run" },
    { name: "run.results", description: "Results for the run" },
    { name: "child", description: "Run details after running a child flow" },
    { name: "child.results", description: "The results for the child flow" },
    { name: "parent", description: "Run details if being called from a parent flow" },
    { name: "parent.results", description: "The results for the parent flow" },
    { name: "webhook", description: "The body of the webhook response" },
    { name: "webhook.status", description: "The status of the webhook call" },
    { name: "webhook.status_code", description: "The status code returned from the webhook" },
    { name: "webhook.url", description: "The URL which was called" },
    { name: "webhook.body", description: "The body of the webhook response" },
    { name: "webhook.json", description: "The JSON parsed body of the response, can access subelements" },
    { name: "webhook.request", description: "The raw request of the webhook including headers" },
    { name: "webhook.response", description: "The raw response of the webhook including headers" },
]

export class TextInputElement extends FormWidget<TextInputProps, TextInputState> {

    private selectedEle: any;
    private textElement: HTMLTextElement;

    private options: CompletionOption[];

    constructor(props: any) {
        super(props);

        this.state = {
            value: this.props.value ? this.props.value : "",
            caretOffset: 0,
            caretCoordinates: { left: 0, top: 0 },
            errors: [],
            completionVisible: false,
            selectedOptionIndex: 0,
            matches: [],
            query: ""
        };

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);

        if (this.props.autocomplete) {
            this.options = OPTIONS.concat(ComponentMap.get().getResultNames());
        }
    }

    private setSelection(index: number) {

        // can't exceed the last option
        if (index >= this.state.matches.length) {
            index = this.state.matches.length - 1;
        }

        // can't go beyond the first option
        if (index < 0) { index = 0; }

        if (index != this.state.selectedOptionIndex) {
            this.setState({
                selectedOptionIndex: index
            })
        }
    }

    private onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {

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
                var ele: any = ReactDOM.findDOMNode(this.textElement as any);

                this.setState({
                    completionVisible: true,
                    caretCoordinates: getCaretCoordinates(ele, ele.selectionEnd),
                });

                break;

            case KEY_ESC:
                if (this.state.completionVisible) {
                    this.setState({
                        completionVisible: false
                    })
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;

            case KEY_TAB:
            case KEY_ENTER:
                if (this.state.completionVisible && this.state.matches.length > 0) {
                    var option = this.state.matches[this.state.selectedOptionIndex];
                    var newValue = this.state.value.substr(0, this.state.caretOffset - this.state.query.length);
                    newValue += option.name;

                    var newCaret = newValue.length;
                    newValue += this.state.value.substr(this.state.caretOffset);

                    var query = ""
                    var completionVisible = false
                    var matches: CompletionOption[] = []
                    if (event.keyCode == KEY_TAB) {
                        query = option.name
                        matches = this.filterOptions(query)
                        completionVisible = matches.length > 0
                    }

                    this.setState({
                        query: query,
                        value: newValue,
                        matches: matches,
                        caretOffset: newCaret,
                        completionVisible: completionVisible,
                        selectedOptionIndex: 0,
                    }, () => {
                        inputSelection.setCaretPosition(ReactDOM.findDOMNode(this.textElement as any), newCaret);
                    });

                    // TODO: set caret position
                    event.preventDefault();
                    event.stopPropagation();

                    //
                }

                break;

            case KEY_BACKSPACE:
                // iterate backwards on our value until we reach either a space or @
                var caret = event.currentTarget.selectionStart - 1;
                for (var i = caret - 1; i >= 0; i--) {
                    var curr = this.state.value[i]

                    // space, don't do anything but break out
                    if (curr == " ") {
                        break
                    }

                    // @ we display again
                    if (curr == "@") {
                        var ele: any = ReactDOM.findDOMNode(this.textElement as any);
                        query = this.state.value.substr(i + 1, caret - i - 1)
                        matches = this.filterOptions(query)
                        completionVisible = matches.length > 0
                        this.setState({
                            query: query,
                            matches: matches,
                            value: this.state.value,
                            caretOffset: caret,
                            completionVisible: completionVisible,
                            selectedOptionIndex: 0,
                            caretCoordinates: getCaretCoordinates(ele, i),
                        });
                        return
                    }
                }

                // we are visible still but really shouldn't be, clear out
                if (this.state.completionVisible) {
                    this.setState({
                        query: "",
                        matches: [],
                        value: this.state.value,
                        caretOffset: caret,
                        completionVisible: false,
                        selectedOptionIndex: 0,
                    })
                }
                break

            case KEY_SPACE:
                this.setState({
                    completionVisible: false
                });
                break;
        }
    }

    private onBlur(event: React.ChangeEvent<HTMLTextElement>) {
        this.setState({
            query: "",
            matches: [],
            value: this.state.value,
            caretOffset: 0,
            selectedOptionIndex: 0,
            completionVisible: false
        }, () => {
            if (this.props.onBlur) {
                this.props.onBlur(event);
            }
        });
    }

    private onChange(event: React.ChangeEvent<HTMLTextElement>) {

        if (this.props.autocomplete) {
            var query: string = null;
            var matches: CompletionOption[] = [];
            if (this.state.completionVisible) {
                var text = event.currentTarget.value;
                query = text.substring(0, event.currentTarget.selectionStart);

                let lastIdx = query.lastIndexOf("@");
                if (lastIdx > -1) {
                    query = query.substring(lastIdx + 1);
                }

                matches = this.filterOptions(query);
            }

            this.setState({
                caretOffset: event.currentTarget.selectionStart,
                matches: matches,
                selectedOptionIndex: 0,
                value: event.currentTarget.value,
                query: query
            });

        } else {
            this.setState({
                value: event.currentTarget.value,
            });
        }

        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    private isValidURL(string: string) {
        var pattern = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/; // fragment locater
        if (!pattern.test(string)) {
            return false;
        } else {
            return true;
        }
    }

    validate(): boolean {
        var errors: string[] = []
        if (this.props.required) {
            if (!this.state.value) {
                errors.push(this.props.name + " is required");
            }
        }

        this.setState({ errors: errors });

        // see if it should be a valid url
        if (errors.length == 0) {
            if (this.props.url) {
                if (!this.isValidURL(this.state.value)) {
                    errors.push("Enter a valid URL");
                }
            }
        }

        return errors.length == 0;
    }

    private filterOptions(query: string): CompletionOption[] {
        if (query != null) {
            var search = query.toLowerCase();
            var results = this.options.filter(
                (option: CompletionOption) => {
                    var rest = option.name.substr(search.length);
                    return option.name.indexOf(search) == 0 && (rest.length == 0 || rest.substr(1).indexOf(".") == -1)
                }
            );
            return results;
        }
        return [];
    }

    private getOptionName(query: string, option: CompletionOption): string {
        return option.name;
    }

    componentDidUpdate(previous: TextInputProps) {
        if (this.selectedEle != null) {
            var selectedOption = ReactDOM.findDOMNode(this.selectedEle);
            if (selectedOption != null) {
                selectedOption.scrollIntoView(false);
            }
        }
    }

    private renderOption(option: CompletionOption, selected: boolean): JSX.Element {
        if (selected) {
            return (
                <div>
                    <div className={styles.option_name}>{option.name}</div>
                    <div className={styles.option_description}>{option.description}</div>
                </div>
            )
        } else {
            return <div className={styles.option_name}>{option.name}</div>
        }
    }

    render() {
        var classes = [styles.textinput];
        if (this.state.errors.length > 0) {
            classes.push(shared.invalid);
        }

        var completionClasses: string[] = [styles.completion_container];
        if (!this.state.completionVisible || this.state.matches.length == 0) {
            completionClasses.push(styles.hidden);
        }

        var options: JSX.Element[] = [];
        this.state.matches.map((option: CompletionOption, index: number) => {
            var optionClasses = [styles.option]
            if (index == this.state.selectedOptionIndex) {
                optionClasses.push(styles.selected);
                if (index == 0) {
                    optionClasses.push(styles.first_option);
                }
                options.push(<li ref={(ele) => { this.selectedEle = ele }} className={optionClasses.join(" ")} key={option.name}>{this.renderOption(option, true)}</li>);
            } else {
                options.push(<li className={optionClasses.join(" ")} key={option.name}>{this.renderOption(option, false)}</li>);
            }
        });

        // use the proper form element
        var TextElement = "input";
        if (this.props.textarea) {
            TextElement = "textarea";
        }

        return (
            <FormElement className={this.props.className} name={this.props.name} helpText={this.props.helpText} showLabel={this.props.showLabel} errors={this.state.errors}>
                <div className={styles.wrapper}>
                    <TextElement ref={(ref: any) => { this.textElement = ref }}
                        className={classes.join(" ")}
                        value={this.state.value}
                        onChange={this.onChange}
                        onBlur={this.onBlur}
                        onKeyDown={this.onKeyDown}
                        placeholder={this.props.placeholder}
                    />
                    <div style={this.state.caretCoordinates} className={completionClasses.join(" ")}>
                        <ul className={styles.option_list}>
                            {options}
                        </ul>
                        <div className={styles.help}>Tab to complete, enter to select</div>
                    </div>
                </div>
            </FormElement>
        )
    }
}
