import * as React from "react";
import * as UUID from 'uuid';
import { toBoolMap } from '../../utils';
import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormValueState } from './FormWidget';
import { SearchResult } from '../ComponentMap';
import { SelectSearch } from '../SelectSearch';

var Select = require('react-select');
var styles = require("./FormElement.scss");

// TODO: these should come from an external source
var reserved = toBoolMap([
    "language",
    "facebook",
    "telegram",
    "email",
    "mailto",
    "name",
    "first name",
    "phone",
    "groups",
    "uuid",
    "created by",
    "modified by",
    "org",
    "is",
    "has",
    "tel"
]);

interface FieldElementProps extends FormElementProps {
    initial: SearchResult;

    getLocalFields?(): SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
}

interface FieldState extends FormValueState {
    field: SearchResult;
}

export class FieldElement extends FormWidget<FieldElementProps, FieldState> {

    constructor(props: any) {
        super(props);

        this.state = {
            field: this.props.initial,
            errors: []
        }

        this.onChange = this.onChange.bind(this);
    }

    onChange(selected: any) {
        this.setState({
            field: selected[0]
        });
    }

    validate(): boolean {
        var errors: string[] = []
        if (this.props.required) {
            if (!this.state.field) {
                errors.push(this.props.name + " is required");
            }
        }

        this.setState({ errors: errors });
        return errors.length == 0;
    }

    isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) { return false; }
        let lowered = option.label.toLowerCase();
        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) && !reserved[lowered];
    }

    createNewOption(arg: { label: string }): SearchResult {
        var newOption: SearchResult = {
            id: UUID.v4(),
            name: arg.label,
            type: "field",
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    render() {

        var isValidNewOption = null;
        var createNewOption = null;
        var createPrompt = null;
        var createOptions = {};

        if (this.props.add) {
            createOptions = {
                isValidNewOption: this.isValidNewOption.bind(this),
                createNewOption: this.createNewOption.bind(this),
                createPrompt: "New Field: "
            }
        }

        var classes = [];
        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes.push("select-invalid");
        }

        var initial: SearchResult[] = [];
        if (this.state.field) {
            initial = [this.state.field];
        }

        return (
            <FormElement showLabel={this.props.showLabel} name={this.props.name} helpText={this.props.helpText} errors={this.state.errors}>
                <SelectSearch
                    className={classes.join(" ")}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    localSearchOptions={this.props.getLocalFields()}
                    multi={false}
                    clearable={false}
                    initial={initial}
                    {...createOptions}
                />
            </FormElement>
        )
    }
}
