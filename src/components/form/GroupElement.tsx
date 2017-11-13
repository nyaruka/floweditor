import * as React from 'react';
import * as UUID from 'uuid';

import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormWidgetState } from './FormWidget';
import { SearchResult } from '../../services/ComponentMap';
import SelectSearch from '../SelectSearch';

const Select = require('react-select');
const styles = require('./FormElement.scss');

interface GroupElementProps extends FormElementProps {
    groups: { group: string; name: string }[];

    localGroups?: SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
}

interface GroupState extends FormWidgetState {
    groups: SearchResult[];
}

export const transformGroups = (groups: { group: string; name: string }[]): SearchResult[] =>
    groups.map(({ name, group }) => ({ name, id: group, type: 'group' }));

export class GroupElement extends FormWidget<GroupElementProps, GroupState> {
    constructor(props: any) {
        super(props);

        this.state = {
            groups: transformGroups(this.props.groups),
            errors: []
        };

        this.onChange = this.onChange.bind(this);
        this.isValidNewOption = this.isValidNewOption.bind(this);
        this.createNewOption = this.createNewOption.bind(this);
    }

    onChange(selected: any) {
        this.setState({
            groups: selected
        });
    }

    validate(): boolean {
        let errors: string[] = [];

        if (this.props.required) {
            if (this.state.groups.length === 0) {
                errors = [...errors, `${this.props.name} is required`];
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) {
            return false;
        }
        const lowered = option.label.toLowerCase();
        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered);
    }

    createNewOption(arg: { label: string }): SearchResult {
        const newOption: SearchResult = {
            id: UUID.v4(),
            name: arg.label,
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    render() {
        let createOptions = {};

        if (this.props.add) {
            createOptions = {
                isValidNewOption: this.isValidNewOption,
                createNewOption: this.createNewOption,
                createPrompt: 'New group: '
            };
        }

        let classes: string[] = [];

        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes = [...classes, 'select-invalid'];
        }

        return (
            <FormElement name={this.props.name} errors={this.state.errors}>
                <SelectSearch
                    className={classes.join(' ')}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="group"
                    localSearchOptions={this.props.localGroups}
                    multi={false}
                    clearable={false}
                    initial={this.state.groups}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
