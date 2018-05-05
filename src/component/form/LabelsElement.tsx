import * as React from 'react';

import { CreateOptions, ResultType } from '../../flowTypes';
import { Asset, Assets, AssetType } from '../../services/AssetService';
import {
    composeCreateNewOption,
    getSelectClass,
    isOptionUnique,
    isValidNewOption,
    jsonEqual,
    snakify
} from '../../utils';
import SelectSearch from '../SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

export interface LabelsElementProps extends FormElementProps {
    add?: boolean;
    labels?: Asset[];
    placeholder?: string;
    searchPromptText?: string;
    helpText?: string;
    assets: Assets;
}

interface LabelsElementState {
    labels: Asset[];
    errors: string[];
}

export const PLACEHOLDER = 'Enter the name of an existing label or create a new one';
export const NOT_FOUND = 'Invalid label';
export const CREATE_PROMPT = 'New label: ';

const createNewOption = composeCreateNewOption({
    idCb: label => snakify(label),
    type: AssetType.Label
});

export default class LabelsElement extends React.Component<LabelsElementProps, LabelsElementState> {
    public static defaultProps = {
        placeholder: PLACEHOLDER,
        searchPromptText: NOT_FOUND
    };

    constructor(props: any) {
        super(props);

        this.state = {
            labels: this.props.labels || [],
            errors: []
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(labels: Asset[]): void {
        if (!jsonEqual(this.state.labels, labels)) {
            this.setState({
                labels
            });
        }
    }

    public validate(): boolean {
        const errors: string[] = [];

        if (this.props.required && !this.state.labels.length) {
            errors.push(`${this.props.name} is required.`);
        }

        this.setState({ errors });

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
                    resultType={ResultType.group}
                    assets={this.props.assets}
                    multi={true}
                    initial={this.state.labels}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
