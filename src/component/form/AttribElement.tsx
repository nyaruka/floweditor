import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { getSelectClass, toBoolMap } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';
import { SearchResult } from '../../store';

// TODO: these should come from an external source
const reserved = toBoolMap(['language', 'name', 'timezone']);

interface AttribElementProps extends FormElementProps {
    initial: SearchResult;
    localFields?: SearchResult[];
    endpoint?: string;
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string;
}

interface AttribState {
    attribute: SearchResult;
    errors: string[];
}

export const PLACEHOLDER: string = 'Enter the name of an existing attribute or create a new one';
export const NOT_FOUND: string = 'Invalid attribute name';

export default class AttribElement extends React.Component<AttribElementProps, AttribState> {
    public static defaultProps = {
        placeholder: PLACEHOLDER,
        searchPromptText: NOT_FOUND
    };

    constructor(props: any) {
        super(props);

        this.state = {
            attribute: this.props.initial,
            errors: []
        };

        this.onChange = this.onChange.bind(this);
        this.isValidNewOption = this.isValidNewOption.bind(this);
        this.createNewOption = this.createNewOption.bind(this);
    }

    private onChange(attribute: SearchResult): void {
        this.setState({
            attribute
        });
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required) {
            if (!this.state.attribute.name) {
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
            type: 'attribute',
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    public render(): JSX.Element {
        const createOptions: any = {};

        if (this.props.add) {
            createOptions.isValidNewOption = this.isValidNewOption;
            createOptions.createNewOption = this.createNewOption;
            createOptions.createPrompt = 'New attribute: ';
        }

        const initial = this.state.attribute ? [this.state.attribute] : [];
        const className = getSelectClass(this.state.errors.length);
        const attribError = this.state.errors.length > 0;

        return (
            <FormElement
                showLabel={this.props.showLabel}
                name={this.props.name}
                helpText={this.props.helpText}
                errors={this.state.errors}
                attribError={attribError}>
                <SelectSearch
                    _className={className}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType="attribute"
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
