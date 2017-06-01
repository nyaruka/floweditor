import * as React from "react";
import * as UUID from 'uuid';

import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormValueState } from './FormWidget';
import { SearchResult } from '../ComponentMap';
import { SelectSearch } from '../SelectSearch';

var Select = require('react-select');
var styles = require("./FormElement.scss");

interface GroupElementProps extends FormElementProps {
    groups: { group: string, name: string }[];

    getLocalGroups?(): SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
}

interface GroupState extends FormValueState {
    groups: SearchResult[];
}

export class GroupElement extends FormWidget<GroupElementProps, GroupState> {

    constructor(props: any) {
        super(props);

        var groups: SearchResult[] = [];
        for (let g of this.props.groups) {
            groups.push({ name: g.name, id: g.group, type: "group" });
        }

        this.state = {
            groups: groups,
            errors: []
        }

        this.onChange = this.onChange.bind(this);
    }

    onChange(selected: any) {
        this.setState({
            groups: selected
        });
    }

    validate(): boolean {
        var errors: string[] = []
        if (this.props.required) {
            if (this.state.groups.length == 0) {
                errors.push(this.props.name + " is required");
            }
        }

        this.setState({ errors: errors });
        return errors.length == 0;
    }

    isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) { return false; }
        let lowered = option.label.toLowerCase();
        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered);
    }

    createNewOption(arg: { label: string }): SearchResult {
        var newOption: SearchResult = {
            id: UUID.v4(),
            name: arg.label,
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
                createPrompt: "New group: "
            }
        }

        var classes = [];
        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes.push("select-invalid");
        }

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    className={classes.join(" ")}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    localSearchOptions={this.props.getLocalGroups()}
                    multi={false}
                    clearable={false}
                    initial={this.state.groups}
                    {...createOptions}
                />
            </FormElement>
        )
    }
}
