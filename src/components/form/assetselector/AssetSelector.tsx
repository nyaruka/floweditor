import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { AsyncCreatable, components } from 'react-select';
import { OptionProps } from 'react-select/lib/components/Option';
import { StylesConfig } from 'react-select/lib/styles';
import { OptionsType } from 'react-select/lib/types';
import { sortByName } from '~/components/form/assetselector/helpers';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import { getIconForAssetType } from '~/components/form/select/helper';
import { getAssets } from '~/external';
import { Asset, Assets, REMOVE_VALUE_ASSET } from '~/store/flowContext';
import { uniqueBy } from '~/utils';

type CallbackFunction = (options: OptionsType<Asset>) => void;

const AssetOption = (props: OptionProps<Asset>) => {
    const asset = (props as any).data as Asset;

    // TODO: add styling for different asset types
    return !props.isDisabled ? (
        <div ref={props.innerRef} {...props.innerProps}>
            <components.Option {...props}>
                {getIconForAssetType(asset.type)} {asset.name}
            </components.Option>
        </div>
    ) : null;
};

export interface AssetSelectorProps extends FormElementProps {
    assets: Assets;
    onChange: (selected: Asset[]) => void;

    // more options to consider when searching
    additionalOptions?: Asset[];

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
            include: [/^is/, /^handle/]
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
        const localMatches = this.handleLocalSearch(input);

        // then query against our endpoint to add to that list
        const assets = this.props.assets;
        let url = assets.endpoint;
        if (input) {
            url += url.indexOf('?') < 0 ? '?' : '&';
            url += 'search=' + encodeURIComponent(input);
        }

        getAssets(url, assets.type, assets.id || 'uuid').then((remoteAssets: Asset[]) => {
            const remoteMatches = remoteAssets.filter((asset: Asset) => this.isMatch(input, asset));
            const removalAsset: Asset[] = this.props.clearable ? [REMOVE_VALUE_ASSET] : [];

            // concat them all together and uniquify them
            const matches = uniqueBy(localMatches.concat(remoteMatches).concat(removalAsset), 'id');

            // if we don't have a name yet for our entry, look in our results for one
            if (this.props.entry.value && !this.props.entry.value.name) {
                const existing = matches.find(
                    (asset: Asset) => asset.id === this.props.entry.value.id
                );
                if (existing) {
                    this.props.onChange([existing]);
                }
            }

            // sort our results and callback
            callback(matches.sort(this.props.sortFunction || sortByName));
        });
    }

    private isMatch(input: string, asset: Asset): boolean {
        return asset.name.toLowerCase().includes(input);
    }

    public handleLocalSearch(inputValue: string): Asset[] {
        const search = inputValue.toLowerCase();
        const matches = Object.keys(this.props.assets.items)
            .map(key => this.props.assets.items[key])
            .filter((asset: Asset) => this.isMatch(search, asset));

        // include our additional matches if we have any
        return matches
            .concat(this.props.additionalOptions || [])
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
        // the default options should be true if there is an endpoint
        let defaultOptions: any = this.props.assets.endpoint !== undefined;

        // or it should be a list of local assets from an empty search
        let value = this.props.entry.value;
        if (!defaultOptions) {
            defaultOptions = this.handleLocalSearch('');

            // if our value doesn't have a name, try to find it
            if (!value.name && value.id) {
                const existing = defaultOptions.find((asset: Asset) => asset.id === value.id);
                if (existing) {
                    value = existing;
                }
            }
        }

        return (
            <FormElement
                name={this.props.name}
                entry={this.props.entry}
                showLabel={this.props.showLabel}
            >
                <AsyncCreatable
                    placeholder={this.props.placeholder || 'Select ' + this.props.name}
                    value={value}
                    components={{ Option: AssetOption }}
                    styles={this.props.styles}
                    defaultOptions={defaultOptions}
                    cacheOptions={true}
                    loadOptions={this.handleLoadOptions}
                    onChange={this.handleChanged}
                    isMulti={this.props.multi}
                    isClearable={false}
                    isSearchable={this.props.searchable}
                    isValidNewOption={this.handleCheckValid}
                    formatCreateLabel={this.handleCreatePrompt}
                    getNewOptionData={this.handleCreateNewOption}
                    onCreateOption={this.props.onCreateOption}
                    getOptionValue={(option: Asset) => option.id}
                    getOptionLabel={(option: Asset) => option.name}
                    noOptionsMessage={(obj: { inputValue: string }) =>
                        this.props.noOptionsMessage || `No ${this.props.name} Found`
                    }
                />
            </FormElement>
        );
    }
}
