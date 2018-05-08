import * as isEqual from 'fast-deep-equal';
import * as React from 'react';

import { CreateOptions, ResultType } from '../../flowTypes';
import { Asset, Assets, AssetType } from '../../services/AssetService';
import {
    composeCreateNewOption,
    getSelectClass,
    isOptionUnique,
    isValidNewOption,
    snakify
} from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

export interface AttribElementProps extends FormElementProps {
    initial: Asset;
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string;
    helpText?: string;
    assets: Assets;
}

interface AttribElementState {
    attribute: Asset;
    errors: string[];
}

export const PLACEHOLDER = 'Enter the name of an existing attribute or create a new one';
export const NOT_FOUND = 'Invalid attribute';
export const CREATE_PROMPT = 'New attribute: ';

export const createNewOption = composeCreateNewOption({
    idCb: label => snakify(label),
    type: AssetType.Field
});

export default class AttribElement extends React.Component<AttribElementProps, AttribElementState> {
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

    private onChange(attribute: Asset): void {
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
                    resultType={ResultType.field}
                    multi={false}
                    assets={this.props.assets}
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
