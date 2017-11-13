import * as React from 'react';
import * as UUID from 'uuid';
import { toBoolMap } from '../../helpers/utils';
import { FormElement, FormElementProps } from './FormElement';
import { FormWidget, FormWidgetState } from './FormWidget';
import ComponentMap, { SearchResult } from '../../services/ComponentMap';
import  SelectSearch from '../SelectSearch';

const Select = require('react-select');
const styles = require('./FormElement.scss');

// TODO: these should come from an external source
const reserved = toBoolMap(['language', 'name', 'timezone']);

interface IFieldElementProps extends FormElementProps {
    initial: SearchResult;

    localFields?: SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
}

interface IFieldState extends FormWidgetState {
    field: SearchResult;
}

export class FieldElement extends FormWidget<IFieldElementProps, IFieldState> {
    constructor(props: any) {
        super(props);

        this.state = {
            field: this.props.initial,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
        this.isValidNewOption = this.isValidNewOption.bind(this);
        this.createNewOption = this.createNewOption.bind(this);
    }

    onChange(selected: any) {
        this.setState({
            field: selected[0]
        });
    }

    validate(): boolean {
        let errors: string[] = [];

        if (this.props.required) {
            if (!this.state.field) {
                errors = [...errors, `${this.props.name} is required`];
            }
        }

        this.setState({ errors });

        return errors.length == 0;
    }

    isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) {
            return false;
        }
        const lowered = option.label.toLowerCase();
        return (
            lowered.length > 0 &&
            lowered.length <= 36 &&
            /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) &&
            !reserved[lowered]
        );
    }

    createNewOption(arg: { label: string }): SearchResult {
        const newOption: SearchResult = {
            id: UUID.v4(),
            name: arg.label,
            type: 'field',
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
                createPrompt: 'New Field: '
            };
        }

        let classes: string[] = [];

        if (this.state.errors.length > 0) {
            // we use a global selector here for react-select
            classes = [...classes, 'select-invalid'];
        }

        let initial: SearchResult[] = [];

        if (this.state.field) {
            initial = [...initial, this.state.field];
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
