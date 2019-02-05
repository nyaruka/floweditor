import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { components, Creatable } from 'react-select';
import { OptionProps } from 'react-select/lib/components/Option';
import { StylesConfig } from 'react-select/lib/styles';
import { OptionsType, ValueType } from 'react-select/lib/types';
import { sortByName } from '~/components/form/assetselector/helpers';
import FormElement, { FormElementProps } from '~/components/form/FormElement';
import { getIconForAssetType } from '~/components/form/select/helper';
import { getAssets, isMatch, postNewAsset, searchAssetMap } from '~/external';
import { Asset, Assets, AssetType, REMOVE_VALUE_ASSET } from '~/store/flowContext';
import { AssetEntry } from '~/store/nodeEditor';
import { uniqueBy } from '~/utils';
import { large, messageStyle } from '~/utils/reactselect';

import * as styles from './AssetSelector.scss';

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

    // a function to exclude assets when matching
    shouldExclude?: (asset: Asset) => boolean;

    // more options to consider when searching
    additionalOptions?: Asset[];

    // add custom styling
    styles?: StylesConfig;

    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;

    // creation options
    createPrefix?: string;
    onAssetCreated?: (asset: Asset) => void;
    createAssetFromInput?: (input: string) => Asset;

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
    isLoading: boolean;
    message?: string;
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
            defaultOptions = searchAssetMap('', props.assets.items);
        }

        this.state = {
            defaultOptions,
            entry: this.props.entry,
            isLoading: false
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
        this.setState({ message: null });
        if (Array.isArray(selected)) {
            this.props.onChange(selected);
        } else if (this.props.onChange) {
            /* istanbul ignore else */
            this.props.onChange([selected]);
        }
    }

    public handleLoadOptions(input: string, callback: CallbackFunction): void {
        const localMatches = searchAssetMap(
            input,
            this.props.assets.items,
            this.props.additionalOptions,
            this.props.shouldExclude
        );

        const assets = this.props.assets;

        // then query against our endpoint to add to that list if we weren't prefetched
        if (!assets.prefetched) {
            let url = assets.endpoint;
            if (url && input) {
                url += url.indexOf('?') < 0 ? '?' : '&';
                url += 'search=' + encodeURIComponent(input);
            }

            getAssets(url, assets.type, assets.id || 'uuid').then((remoteAssets: Asset[]) => {
                const remoteMatches = remoteAssets.filter((asset: Asset) =>
                    isMatch(input, asset, this.props.shouldExclude)
                );
                const removalAsset: Asset[] = this.props.clearable ? [REMOVE_VALUE_ASSET] : [];

                // concat them all together and uniquify them
                const matches = uniqueBy(
                    localMatches.concat(remoteMatches).concat(removalAsset),
                    'id'
                );

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
        } else {
            // only local matches
            callback(localMatches.sort(this.props.sortFunction || sortByName));
        }
    }

    public handleCheckValid(input: string, value: ValueType<Asset>, options: Asset[]): boolean {
        if (!this.props.createAssetFromInput) {
            return false;
        }

        if (input.length > 0) {
            return (
                searchAssetMap(
                    input,
                    this.props.assets.items,
                    this.props.additionalOptions,
                    this.props.shouldExclude
                ).length === 0
            );
        }

        return false;
    }

    public handleCreatePrompt(input: string): any {
        return (this.props.createPrefix || `New ${this.props.name}: `) + input;
    }

    public handleCreateNewOption(inputValue: string, label: any): Asset {
        return { id: '_', name: label, type: null };
    }

    public handleLoadingComplete(): void {
        this.setState({ isLoading: false });
    }

    public handleClearMessage(): void {
        if (this.state.message) {
            this.setState({ message: null });
        }
    }

    public render(): JSX.Element {
        // the default options should be true if there is an endpoint
        let defaultOptions: any = this.props.assets.endpoint !== undefined;

        // or it should be a list of local assets from an empty search
        if (!defaultOptions) {
            defaultOptions = this.state.defaultOptions;

            if (this.props.shouldExclude) {
                defaultOptions = searchAssetMap(
                    '',
                    this.props.assets.items,
                    this.props.additionalOptions,
                    this.props.shouldExclude
                );
            }
        }

        // Perform this in lieu of AsyncCreatable loadOptions
        const localMatches = searchAssetMap(
            '',
            this.props.assets.items,
            this.props.additionalOptions,
            this.props.shouldExclude
        );

        return (
            <FormElement
                name={this.props.name}
                entry={this.props.entry}
                showLabel={this.props.showLabel}
            >
                <Creatable
                    className={styles.selection}
                    placeholder={this.props.placeholder || 'Select ' + this.props.name}
                    value={this.state.entry.value}
                    components={{ Option: AssetOption }}
                    styles={this.state.message ? messageStyle : this.props.styles || large}
                    options={localMatches}
                    onChange={this.handleChanged}
                    onMenuOpen={this.handleClearMessage}
                    onBlur={this.handleClearMessage}
                    menuShouldBlockScroll={true}
                    isMulti={this.props.multi}
                    isDisabled={this.state.isLoading}
                    isLoading={this.state.isLoading}
                    isClearable={false}
                    isSearchable={this.props.searchable}
                    isValidNewOption={this.handleCheckValid}
                    formatCreateLabel={this.handleCreatePrompt}
                    getNewOptionData={this.handleCreateNewOption}
                    onCreateOption={(input: any) => {
                        // mark us as loading
                        this.setState({ isLoading: true, message: null });

                        const payload = this.props.createAssetFromInput(input);
                        postNewAsset(this.props.assets, payload)
                            .then((asset: Asset) => {
                                this.setState({ isLoading: false });
                                this.props.onAssetCreated(asset);
                            })
                            .catch(error => {
                                this.setState({
                                    message: `Couldn't create new ${
                                        this.props.assets.type
                                    } "${input}"`,
                                    isLoading: false
                                });
                            });
                    }}
                    getOptionValue={(option: Asset) => option.id}
                    getOptionLabel={(option: Asset) => option.name}

                    // We are currently using Creatable since our assets are currently
                    // being preloaded page load and because of isLoaded not being
                    // honored when set manually (this is needed to perform onCreateOption
                    // via call to asset endpoint with feedback). Once that fix is merged,
                    // we can consider using AsyncCreateable
                    // See: https://github.com/JedWatson/react-select/pull/3319
                    //
                    // To use AsyncCreatable, use the following props
                    // defaultOptions={defaultOptions}
                    // cacheOptions={true}
                    // loadOptions={this.handleLoadOptions}
                    // noOptionsMessage={(obj: { inputValue: string }) =>
                    //    this.props.noOptionsMessage || `No ${this.props.name} Found`
                    // }
                />
                {this.state.message ? (
                    <div className={styles.message}>{this.state.message}</div>
                ) : null}
            </FormElement>
        );
    }
}
