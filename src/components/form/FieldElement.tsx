import * as React from 'react';
import * as UUID from 'uuid';
import { toBoolMap } from '../../helpers/utils';
import { FormElement, IFormElementProps } from './FormElement';
import { FormWidget, IFormValueState } from './FormWidget';
import ComponentMap, { ISearchResult } from '../../services/ComponentMap';
import { SelectSearch } from '../SelectSearch';

var Select = require('react-select');
var styles = require('./FormElement.scss');

// TODO: these should come from an external source
var reserved = toBoolMap(['language', 'name', 'timezone']);

interface IFieldElementProps extends IFormElementProps {
    initial: ISearchResult;

    localFields?: ISearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
}

interface IFieldState extends IFormValueState {
    field: ISearchResult;
}

export class FieldElement extends FormWidget<IFieldElementProps, IFieldState> {
    constructor(props: any) {
        super(props);

        this.state = {
            field: this.props.initial,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    onChange(selected: any) {
        this.setState({
            field: selected[0]
        });
    }

    validate(): boolean {
        var errors: string[] = [];
        if (this.props.required) {
            if (!this.state.field) {
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
        return (
            lowered.length > 0 &&
            lowered.length <= 36 &&
            /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) &&
            !reserved[lowered]
        );
    }

    createNewOption(arg: { label: string }): ISearchResult {
        var newOption: ISearchResult = {
            id: UUID.v4(),
            name: arg.label,
            type: 'field',
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
                createPrompt: 'New Field: '
            };
        }

        var classes = [];
        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes.push('select-invalid');
        }

        var initial: ISearchResult[] = [];
        if (this.state.field) {
            initial = [this.state.field];
        }

        return (
            <FormElement
                showLabel={this.props.showLabel}
                name={this.props.name}
                helpText={this.props.helpText}
                errors={this.state.errors}>
                <SelectSearch
                    className={classes.join(' ')}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="field"
                    localSearchOptions={this.props.localFields}
                    multi={false}
                    clearable={false}
                    initial={initial}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
