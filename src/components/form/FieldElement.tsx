import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import Select from 'react-select';
import { toBoolMap, getSelectClass } from '../../helpers/utils';
import FormElement, { FormElementProps } from './FormElement';
import ComponentMap, { SearchResult } from '../../services/ComponentMap';
import SelectSearch from './SelectSearch';

import * as styles from './FormElement.scss';

// TODO: these should come from an external source
const reserved = toBoolMap(['language', 'name', 'timezone']);

interface FieldElementProps extends FormElementProps {
    initial: SearchResult;
    localFields?: SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
}

interface FieldState {
    field: SearchResult;
    errors: string[];
}

export const placeholder: string =
    'Enter the name of an existing group, or create a new group to add the contact to';
export const notFound: string = 'Invalid field name';

export default class FieldElement extends React.Component<FieldElementProps, FieldState> {
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

    private onChange([field]: any): void {
        this.setState({
            field
        });
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (!this.state.field) {
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

        const lowered = label.toLowerCase();

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

        const initial: SearchResult[] = this.state.field ? [this.state.field] : [];

        const className: string = getSelectClass(this.state.errors.length);

        const fieldError = this.state.errors.length > 0;

        return (
            <FormElement
                showLabel={this.props.showLabel}
                name={this.props.name}
                helpText={this.props.helpText}
                errors={this.state.errors}
                fieldError={fieldError}>
                <SelectSearch
                    className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="field"
                    localSearchOptions={this.props.localFields}
                    multi={false}
                    clearable={false}
                    initial={initial}
                    searchPromptText={notFound}
                    placeholder={placeholder}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
