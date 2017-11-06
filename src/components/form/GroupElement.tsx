import * as React from 'react';
import * as UUID from 'uuid';

import { FormElement, IFormElementProps } from './FormElement';
import { FormWidget, IFormValueState } from './FormWidget';
import { ISearchResult } from '../../services/ComponentMap';
import { SelectSearch } from '../SelectSearch';

var Select = require('react-select');
var styles = require('./FormElement.scss');

interface IGroupElementProps extends IFormElementProps {
    groups: { group: string; name: string }[];

    localGroups?: ISearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
}

interface IGroupState extends IFormValueState {
    groups: ISearchResult[];
}

export class GroupElement extends FormWidget<IGroupElementProps, IGroupState> {
    constructor(props: any) {
        super(props);

        var groups: ISearchResult[] = [];
        for (let g of this.props.groups) {
            groups.push({ name: g.name, id: g.group, type: 'group' });
        }

        this.state = {
            groups: groups,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(selected: any) {
        this.setState({
            groups: selected
        });
    }

    validate(): boolean {
        var errors: string[] = [];
        if (this.props.required) {
            if (this.state.groups.length == 0) {
                errors.push(this.props.name + ' is required');
            }
        }

        this.setState({ errors: errors });
        return errors.length == 0;
    }

    isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) {
            return false;
        }
        let lowered = option.label.toLowerCase();
        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered);
    }

    createNewOption(arg: { label: string }): ISearchResult {
        var newOption: ISearchResult = {
            id: UUID.v4(),
            name: arg.label,
            extraResult: true
        } as ISearchResult;

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
                createPrompt: 'New group: '
            };
        }

        var classes = [];
        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes.push('select-invalid');
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
