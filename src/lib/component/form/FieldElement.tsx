import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import Select from 'react-select';
import { Node } from '../../flowTypes';
import { toBoolMap, getSelectClass, jsonEqual } from '../../utils';
import FormElement, { FormElementProps } from './FormElement';
import ComponentMap, { SearchResult } from '../../services/ComponentMap';
import SelectSearch, { SelectSearchProps } from '../SelectSearch';

export interface FieldElementProps extends FormElementProps {
    initial?: SearchResult;
    localFields?: SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
    __className?: string;
    searchPromptText?: string;
    fieldNameAtNode?: string;
    onChange?: (field: SearchResult) => void;
}

interface FieldState {
    field: SearchResult;
    errors: string[];
}

export const FIELD_PLACEHOLDER = 'Enter the name of an existing field...';
export const FIELD_NOT_FOUND = 'Enter the name of an existing field';
export const FIELD_PROMPT = 'New Field: ';
export const RESULT_TYPE_FIELD = 'field';

export const isValidNewOption = (
    { label }: { label: string } = { label: '' }
): boolean => {
    if (!label) {
        return false;
    }

    const lowered: string = label.toLowerCase();

    const isValid: boolean =
        lowered.length > 0 &&
        lowered.length <= 36 &&
        /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) &&
        !reserved[lowered];

    return isValid;
};

export const createNewOption = ({ label }: { label: string }): SearchResult => {
    const newOption: SearchResult = {
        id: generateUUID(),
        name: label,
        type: 'field',
        extraResult: true
    } as SearchResult;

    return newOption;
};

// TODO: these should come from an external source
const reserved = toBoolMap(['language', 'name', 'timezone']);

export default class FieldElement extends React.Component<
    FieldElementProps,
    FieldState
> {
    constructor(props: any) {
        super(props);

        this.state = {
            field: props.initial,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    public componentWillReceiveProps(nextProps: FieldElementProps): void {
        if (!jsonEqual(this.props.initial, nextProps.initial)) {
            this.setState({ field: nextProps.initial });
        }
    }

    private onChange([field]: SearchResult[]): void {
        if (this.state.field !== field) {
            this.setState(
                {
                    field
                },
                () => this.props.onChange && this.props.onChange(field)
            );
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (
            this.props.required &&
            (!this.state.field || !this.state.field.name)
        ) {
            errors.push(`${this.props.name} is required`);
        }

        this.setState({ errors });

        const isValid: boolean = errors.length === 0;

        return isValid;
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.createNewOption = createNewOption;
            createOptions.createPrompt = FIELD_PROMPT;
        }

        const initial: SearchResult[] = this.state.field
            ? [this.state.field]
            : [];
        const className: string = getSelectClass(this.state.errors.length);
        const fieldError: boolean = this.state.errors.length > 0;
        const searchPromptText = this.props.searchPromptText || FIELD_NOT_FOUND;
        const placeholder = this.props.placeholder || FIELD_PLACEHOLDER;

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
                    initial={initial}
                    searchPromptText={searchPromptText}
                    placeholder={placeholder}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
