import * as React from 'react';
import { v4 as generateUUID } from 'uuid';

import { CreateOptions, ResultType } from '../../flowTypes';
import { Asset, Assets, AssetType } from '../../services/AssetService';
import {
    composeCreateNewOption,
    getSelectClass,
    isOptionUnique,
    isValidNewOption,
    LabelIdCb
} from '../../utils';
import SelectSearch from '../SelectSearch/SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

export interface LabelsElementProps extends FormElementProps {
    assets: Assets;
    labels?: Asset[];
    placeholder?: string;
    searchPromptText?: string;
    helpText?: string;
}

interface LabelsElementState {
    labels: Asset[];
    errors: string[];
}

export const NAME = 'Labels';
export const PLACEHOLDER = 'Enter the name of an existing label or create a new one';
export const NOT_FOUND = 'Invalid label';
export const CREATE_PROMPT = 'New label: ';

export const labelIdCb: LabelIdCb = () => generateUUID();

export const createNewOption = composeCreateNewOption({
    idCb: labelIdCb,
    type: AssetType.Label
});

export default class LabelsElement extends React.Component<LabelsElementProps, LabelsElementState> {
    public static defaultProps = {
        name: NAME,
        placeholder: PLACEHOLDER,
        searchPromptText: NOT_FOUND,
        required: true
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
        this.setState({
            labels
        });
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
        const createOptions: CreateOptions = {
            isValidNewOption,
            isOptionUnique,
            createNewOption,
            createPrompt: CREATE_PROMPT
        };

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
