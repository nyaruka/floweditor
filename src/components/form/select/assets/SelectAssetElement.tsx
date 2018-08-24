import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { NewOptionCreatorHandler } from 'react-select';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import SelectSearch from '~/components/form/select/SelectSearch';
import { CreateOptions } from '~/flowTypes';
import { Asset, Assets } from '~/services/AssetService';
import { getSelectClassForEntry, isOptionUnique, isValidNewOption } from '~/utils';

export interface SelectAssetElementProps extends FormElementProps {
    endpoint?: string;
    placeholder?: string;
    assets: Assets;

    add?: boolean;
    searchable: boolean;
    onCreateOption?: NewOptionCreatorHandler;
    createPrompt?: string;
    clearable?: boolean;
    notFoundText?: string;
    onChange?: (selected: Asset[]) => void;
    sortFunction?(a: Asset, b: Asset): number;
    localSearchOptions?: Asset[];
}

export default class SelectAssetElement extends React.Component<SelectAssetElementProps> {
    constructor(props: SelectAssetElementProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^get/, /^on/, /^handle/]
        });
    }

    private handleChanged(selected: Asset[]): void {
        /* istanbul ignore else */
        if (this.props.onChange) {
            this.props.onChange(selected);
        }
    }

    public render(): JSX.Element {
        const createOptions: CreateOptions = {};

        if (this.props.add) {
            createOptions.createNewOption = this.props.onCreateOption;
            createOptions.createPrompt = this.props.createPrompt || 'New: ';
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.isOptionUnique = isOptionUnique;
        }

        return (
            <FormElement
                name={this.props.name}
                entry={this.props.entry}
                showLabel={this.props.showLabel}
            >
                <SelectSearch
                    __className={getSelectClassForEntry(this.props.entry)}
                    onChange={this.handleChanged}
                    name={this.props.name}
                    assets={this.props.assets}
                    searchable={this.props.searchable}
                    multi={false}
                    initial={[this.props.entry.value]}
                    localSearchOptions={this.props.localSearchOptions}
                    sortFunction={this.props.sortFunction}
                    searchPromptText={this.props.notFoundText}
                    placeholder={this.props.placeholder}
                    actionClearable={this.props.clearable}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}
