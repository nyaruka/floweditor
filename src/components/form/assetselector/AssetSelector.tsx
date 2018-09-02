import { react as bindCallbacks } from 'auto-bind';
import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import { AsyncCreatable, components } from 'react-select';
import { OptionProps } from 'react-select/lib/components/Option';
import { StylesConfig } from 'react-select/lib/styles';
import { OptionsType } from 'react-select/lib/types';
import { sortByName } from '~/components/form/assetselector/helpers';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import { Asset } from '~/services/AssetService';
import { Assets } from '~/store/flowContext';

type CallbackFunction = (options: OptionsType<Asset>) => void;

const AssetOption = (props: OptionProps<Asset>) => {
    const asset = (props as any).data as Asset;

    // TODO: add styling for different asset types
    return !props.isDisabled ? (
        <div ref={props.innerRef} {...props.innerProps}>
            <components.Option {...props}>{asset.name}</components.Option>
        </div>
    ) : null;
};

export interface AssetSelectorProps extends FormElementProps {
    assets: Assets;
    onChange: (selected: Asset[]) => void;

    // add custom styling
    styles?: StylesConfig;

    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;

    // creation options
    allowCreation?: boolean;
    onCreateOption?: any;
    createPrefix?: string;

    // supports multiple selection
    multi?: boolean;

    // overrids default message when no options to show
    noOptionsMessage?: string;

    // override default sorting function
    sortFunction?(a: Asset, b: Asset): number;
}

export default class AssetSelector extends React.Component<AssetSelectorProps> {
    constructor(props: AssetSelectorProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^get/, /^on/, /^is/, /^handle/]
        });
    }

    private handleChanged(selected: any): void {
        if (Array.isArray(selected)) {
            this.props.onChange(selected);
        } else if (this.props.onChange) {
            /* istanbul ignore else */
            this.props.onChange([selected]);
        }
    }

    public handleLoadOptions(input: string, callback: CallbackFunction): void {
        const matches = this.handleFilter(input);

        // then query against our endpoint to add to that list
        const assets = this.props.assets;
        let url = assets.endpoint;
        if (input) {
            url += '?query=' + encodeURIComponent(input);
        }

        const id = assets.id || 'uuid';
        axios.get(url).then((response: AxiosResponse) => {
            // Only attempt to match if response contains a list of externally-fetched assets
            if (response.data) {
                for (const result of response.data.results) {
                    if (this.isMatch(input, result)) {
                        matches.push({
                            name: result.name,
                            id: result[id],
                            type: assets.type
                        });
                    }
                }
            }

            callback(matches.sort(this.props.sortFunction || sortByName));
        });
    }

    private isMatch(input: string, asset: Asset): boolean {
        return asset.name.toLowerCase().includes(input);
    }

    public handleFilter(inputValue: string): Asset[] {
        const search = inputValue.toLowerCase();
        return Object.keys(this.props.assets.items)
            .map(key => this.props.assets.items[key])
            .filter((asset: Asset) => this.isMatch(search, asset));
    }

    public handleCheckValid(inputValue: string): boolean {
        if (!this.props.onCreateOption) {
            return false;
        }
        return inputValue.length > 0;
    }

    public handleCreatePrompt(input: string): any {
        return (this.props.createPrefix || `New ${this.props.name}: `) + input;
    }

    public handleCreateNewOption(inputValue: string, label: any): Asset {
        return { id: '_', name: label, type: null };
    }

    public render(): JSX.Element {
        return (
            <FormElement
                name={this.props.name}
                entry={this.props.entry}
                showLabel={this.props.showLabel}
            >
                <AsyncCreatable
                    placeholder={this.props.placeholder || 'Select ' + this.props.name}
                    value={this.props.entry.value}
                    components={{ Option: AssetOption }}
                    styles={this.props.styles}
                    defaultOptions={true}
                    cacheOptions={true}
                    loadOptions={this.handleLoadOptions}
                    onChange={this.handleChanged}
                    isMulti={this.props.multi}
                    isSearchable={this.props.searchable}
                    isValidNewOption={this.handleCheckValid}
                    formatCreateLabel={this.handleCreatePrompt}
                    getNewOptionData={this.handleCreateNewOption}
                    onCreateOption={this.props.onCreateOption}
                    noOptionsMessage={(obj: { inputValue: string }) => this.props.noOptionsMessage}
                    getOptionValue={(option: Asset) => option.id}
                    getOptionLabel={(option: Asset) => option.name}
                />
            </FormElement>
        );
    }
}
