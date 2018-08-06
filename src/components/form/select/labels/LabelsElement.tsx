import * as React from 'react';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import SelectSearch from '~/components/form/select/SelectSearch';
import { CreateOptions } from '~/flowTypes';
import { Asset, Assets, AssetType } from '~/services/AssetService';
import {
    composeCreateNewOption,
    getSelectClassForEntry,
    isOptionUnique,
    isValidNewOption,
    LabelIdCb,
    createUUID
} from '~/utils';

export interface LabelsElementProps extends FormElementProps {
    assets: Assets;
    placeholder?: string;
    searchPromptText?: string;
    helpText?: string;
    onChange: (groups: Asset[]) => void;
}

interface LabelsElementState {
    labels: Asset[];
}

export const NAME = 'Labels';
export const PLACEHOLDER = 'Enter the name of an existing label or create a new one';
export const NOT_FOUND = 'Invalid label';
export const CREATE_PROMPT = 'New label: ';

export const labelIdCb: LabelIdCb = () => createUUID();

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
                entry={this.props.entry}
                // attribError={this.state.errors.length > 0}
            >
                <SelectSearch
                    __className={getSelectClassForEntry(this.props.entry)}
                    onChange={this.props.onChange}
                    name={this.props.name}
                    assets={this.props.assets}
                    multi={true}
                    initial={this.props.entry.value}
                    placeholder={this.props.placeholder}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
