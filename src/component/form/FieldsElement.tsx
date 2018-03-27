import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { SearchResult } from '../../store';
import { getSelectClass, toBoolMap } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

// TODO: these should come from an external source
const reserved = {
    language: true,
    name: true,
    timezone: true
};

// const reserved = toBoolMap(['language', 'name', 'timezone'])

export interface FieldsElementProps extends FormElementProps {
    initial: SearchResult;
    localFields?: SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string;
}

interface FieldsState {
    field: SearchResult;
    errors: string[];
}

export const PLACEHOLDER: string = 'Enter the name of an existing field or create a new one';
export const NOT_FOUND: string = 'Invalid field name';

export default class FieldElement extends React.Component<FieldsElementProps, FieldsState> {
    public static defaultProps = {
        placeholder: PLACEHOLDER,
        searchPromptText: NOT_FOUND
    };

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

    private onChange(field: SearchResult): void {
        this.setState({
            field
        });
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (!this.state.field.name) {
                errors.push(`${this.props.name} is required`);
            }
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    private isValidNewOption({ label }: { label: string }): boolean {
        if (!label) {
            return false;
        }

        const lowered: string = label.toLowerCase();

        return (
            lowered.length > 0 &&
            lowered.length <= 36 &&
            /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) &&
            !reserved[lowered]
        );
    }

    private createNewOption({ label }: { label: string }): SearchResult {
        const newOption: SearchResult = {
            id: generateUUID(),
            name: label,
            type: 'field',
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = this.isValidNewOption;
            createOptions.createNewOption = this.createNewOption;
            createOptions.createPrompt = 'New Field: ';
        }

        const initial = this.state.field ? [this.state.field] : [];
        const className = getSelectClass(this.state.errors.length);
        const fieldError = this.state.errors.length > 0;

        return (
            <FormElement
                showLabel={this.props.showLabel}
                name={this.props.name}
                helpText={this.props.helpText}
                errors={this.state.errors}
                fieldError={fieldError}
            >
                <SelectSearch
                    _className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="field"
                    localSearchOptions={this.props.localFields}
                    multi={false}
                    clearable={false}
                    initial={initial}
                    searchPromptText={this.props.searchPromptText}
                    placeholder={this.props.placeholder}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
