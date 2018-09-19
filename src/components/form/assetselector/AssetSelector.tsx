import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { AsyncCreatable, components } from 'react-select';
import { OptionProps } from 'react-select/lib/components/Option';
import { StylesConfig } from 'react-select/lib/styles';
import { OptionsType } from 'react-select/lib/types';
import { isMatch, searchAssets, sortByName } from '~/components/form/assetselector/helpers';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import { getIconForAssetType } from '~/components/form/select/helper';
import { getAssets } from '~/external';
import { Asset, Assets, AssetType, REMOVE_VALUE_ASSET } from '~/store/flowContext';
import { AssetEntry } from '~/store/nodeEditor';
import { uniqueBy } from '~/utils';

type CallbackFunction = (options: OptionsType<Asset>) => void;

const AssetOption = (props: OptionProps<Asset>) => {
    const asset = (props as any).data as Asset;

    const prefix = '';
    let suffix = '';
    if (asset.type === AssetType.Currency) {
        suffix = ` (${asset.id})`;
    }

    // TODO: add styling for different asset types
    return !props.isDisabled ? (
        <div ref={props.innerRef} {...props.innerProps}>
            <components.Option {...props}>
                {prefix}
                {getIconForAssetType(asset.type)} {asset.name}
                {suffix}
            </components.Option>
        </div>
    ) : null;
};

export interface AssetSelectorProps extends FormElementProps {
    assets: Assets;
    onChange: (selected: Asset[]) => void;

    // list of ids to exclude from matches
    excludeOptions?: string[];

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

interface AssetSelectorState {
    defaultOptions: Asset[];
    entry: AssetEntry;
}

export default class AssetSelector extends React.Component<AssetSelectorProps, AssetSelectorState> {
    constructor(props: AssetSelectorProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^is/, /^handle/]
        });

        let defaultOptions: Asset[] = [];

        // or it should be a list of local assets from an empty search
        if (!props.assets.endpoint) {
            defaultOptions = searchAssets('', props.assets.items);
        }

        this.state = {
            defaultOptions,
            entry: this.props.entry
        };
    }

    public static getDerivedStateFromProps(
        nextProps: AssetSelectorProps,
        prevState: AssetSelectorState
    ): Partial<AssetSelectorState> {
        // the default options should be true if there is an endpoint
        let entry = nextProps.entry;

        // if we don't know our entry name, look for it
        if (prevState.defaultOptions && entry.value && !entry.value.name) {
            const existing = prevState.defaultOptions.find(
                (asset: Asset) => asset.id === entry.value.id
            );
            if (existing) {
                entry = { value: existing };
            }
        }

        return { entry };
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
        const localMatches = searchAssets(
            input,
            this.props.assets.items,
            this.props.additionalOptions,
            this.props.excludeOptions
        );

        // then query against our endpoint to add to that list
        const assets = this.props.assets;
        let url = assets.endpoint;
        if (url && input) {
            url += url.indexOf('?') < 0 ? '?' : '&';
            url += 'search=' + encodeURIComponent(input);
        }

        getAssets(url, assets.type, assets.id || 'uuid').then((remoteAssets: Asset[]) => {
            const remoteMatches = remoteAssets.filter((asset: Asset) =>
                isMatch(input, asset, this.props.excludeOptions)
            );
            const removalAsset: Asset[] = this.props.clearable ? [REMOVE_VALUE_ASSET] : [];

            // concat them all together and uniquify them
            const matches = uniqueBy(localMatches.concat(remoteMatches).concat(removalAsset), 'id');

            // if we don't know our initial name, look for it
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
        if (!defaultOptions) {
            defaultOptions = this.state.defaultOptions;

            if (this.props.excludeOptions) {
                defaultOptions = searchAssets(
                    '',
                    this.props.assets.items,
                    this.props.additionalOptions,
                    this.props.excludeOptions
                );
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
                    value={this.state.entry.value}
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
