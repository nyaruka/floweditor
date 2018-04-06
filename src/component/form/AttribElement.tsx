import * as isEqual from 'fast-deep-equal';
import * as React from 'react';
import { connect } from 'react-redux';
import {
    IsOptionUniqueHandler,
    IsValidNewOptionHandler,
    NewOptionCreatorHandler
} from 'react-select';
import { v4 as generateUUID } from 'uuid';
import { AttributeType, ResultType, CreateOptions } from '../../flowTypes';
import { AppState, SearchResult } from '../../store';
import { getSelectClass, propertyExists } from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

interface AttribElementPassedProps extends FormElementProps {
    initial: SearchResult;
    endpoint: string;
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string;
    helpText?: string;
}

interface AttribElementStoreProps {
    contactFields: SearchResult[];
}

export type AttribElementProps = AttribElementPassedProps & AttribElementStoreProps;

interface AttribElementState {
    attribute: SearchResult;
    errors: string[];
}

export const PLACEHOLDER = 'Enter the name of an existing attribute or create a new one';
export const NOT_FOUND = 'Invalid attribute name';
export const VALID_FIELD = /^[a-z0-9-][a-z0-9- ]*$/;
export const CREATE_PROMPT = 'New attribute: ';

export const attribExists = (newOptName: string, options: SearchResult[]) =>
    options.find(({ name }) => name.toLowerCase().trim() === newOptName.toLowerCase().trim())
        ? true
        : false;

export const fieldNameValid = (name: string = '') => {
    const lowered = name.toLowerCase();
    return lowered.length > 0 && lowered.length <= 36 && VALID_FIELD.test(lowered);
};

export const isValidNewOption: IsValidNewOptionHandler = ({ label }) => fieldNameValid(label);

export const isOptionUnique: IsOptionUniqueHandler = ({ option, options, labelKey, valueKey }) =>
    !propertyExists(option.name) && !attribExists(option.name, options);

export const createNewOption: NewOptionCreatorHandler = ({ label }) => ({
    id: generateUUID(),
    name: label,
    type: AttributeType.field,
    extraResult: true
});

export class AttribElement extends React.Component<AttribElementProps, AttribElementState> {
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
    }

    private onChange(attribute: SearchResult): void {
        if (!isEqual(this.state.attribute, attribute)) {
            this.setState({ attribute });
        }
    }

    private getErrors(): string[] {
        const errors = [];

        if (this.props.required && !this.state.attribute.name) {
            errors.push(`${this.props.name} is required.`);
        }

        return errors;
    }

    public updateErrorState(errors: string[]): void {
        if (!isEqual(this.state.errors, errors)) {
            this.setState({ errors });
        }
    }

    public validate(): boolean {
        const errors = this.getErrors();
        this.updateErrorState(errors);
        return errors.length === 0;
    }

    public render(): JSX.Element {
        const createOptions: CreateOptions = {};

        if (this.props.add) {
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.isOptionUnique = isOptionUnique;
            createOptions.createNewOption = createNewOption;
            createOptions.createPrompt = CREATE_PROMPT;
        }

        return (
            <FormElement
                showLabel={this.props.showLabel}
                name={this.props.name}
                helpText={this.props.helpText}
                errors={this.state.errors}
                attribError={this.state.errors.length > 0}
            >
                <SelectSearch
                    __className={getSelectClass(this.state.errors.length)}
                    onChange={this.onChange}
                    name={this.props.name}
                    url={this.props.endpoint}
                    resultType={ResultType.field}
                    localSearchOptions={this.props.contactFields}
                    multi={false}
                    initial={[this.state.attribute]}
                    closeOnSelect={true}
                    searchPromptText={this.props.searchPromptText}
                    placeholder={this.props.placeholder}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}

export const mapStateToProps = ({ flowContext: { contactFields } }: AppState) => ({
    contactFields
});

export default connect<{ contactFields: SearchResult[] }, {}, AttribElementPassedProps>(
    mapStateToProps,
    null,
    null,
    {
        withRef: true
    }
)(AttribElement);
