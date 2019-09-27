import { react as bindCallbacks } from 'auto-bind';
import { hasErrors } from 'components/flow/actions/helpers';
import { sortByName } from 'components/form/assetselector/helpers';
import { getIconForAssetType } from 'components/form/assetselector/widgets';
import FormElement, { FormElementProps } from 'components/form/FormElement';
import { getAssets, isMatch, postNewAsset, searchAssetMap } from 'external';
import * as React from 'react';
import Async from 'react-select/lib/Async';
import { components } from 'react-select/lib/components';
import { OptionProps } from 'react-select/lib/components/Option';
import Creatable from 'react-select/lib/Creatable';
import { StylesConfig } from 'react-select/lib/styles';
import { OptionsType, ValueType } from 'react-select/lib/types';
import { Asset, Assets, AssetType, CompletionOption, REMOVE_VALUE_ASSET } from 'store/flowContext';
import { AssetEntry } from 'store/nodeEditor';
import { uniqueBy } from 'utils';
import { getErroredSelect as getErroredControl, large, messageStyle } from 'utils/reactselect';

import styles from './AssetSelector.module.scss';
import { getCompletions, CompletionAssets } from 'utils/completion';

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
        {getIconForAssetType(asset)} {asset.name}
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

  // do we give the clearing option (trash)
  valueClearable?: boolean;

  // do we present an x to clear the form
  formClearable?: boolean;

  onFilter?: (asset: Asset) => boolean;

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

  // completion options
  completion?: CompletionAssets;
}

interface AssetSelectorState {
  defaultOptions: Asset[];
  entry: AssetEntry;
  isLoading: boolean;
  menuOpen: boolean;
  message?: string;
}

export default class AssetSelector extends React.Component<AssetSelectorProps, AssetSelectorState> {
  private lastCreation: number = 0;

  constructor(props: AssetSelectorProps) {
    super(props);
    bindCallbacks(this, {
      include: [/^is/, /^handle/, /^get/]
    });

    let defaultOptions: Asset[] = [];

    // or it should be a list of local assets from an empty search
    if (!props.assets.endpoint) {
      defaultOptions = searchAssetMap('', props.assets.items);
    }

    this.state = {
      menuOpen: false,
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
      const existing = prevState.defaultOptions.find((asset: Asset) => asset.id === entry.value.id);
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
    let options = this.props.additionalOptions || [];

    if (this.props.completion && input.startsWith('@')) {
      const completions = getCompletions(this.props.completion, input.substr(1));

      callback(
        completions.map((option: CompletionOption) => {
          return {
            id: '@' + option.name,
            name: '@' + option.name,
            type: AssetType.Expression
          };
        })
      );
      return;
    }

    let localMatches = searchAssetMap(
      input,
      this.props.assets.items,
      options,
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
        const removalAsset: Asset[] = this.props.valueClearable ? [REMOVE_VALUE_ASSET] : [];

        // concat them all together and uniquify them
        let matches = uniqueBy(localMatches.concat(remoteMatches).concat(removalAsset), 'id');

        // if we don't know our initial name, look for it
        if (this.props.entry.value && !this.props.entry.value.name) {
          const existing = matches.find((asset: Asset) => asset.id === this.props.entry.value.id);
          if (existing) {
            this.props.onChange([existing]);
          }
        }

        if (this.props.onFilter) {
          matches = matches.filter(this.props.onFilter);
        }

        // sort our results and callback
        callback(matches.sort(this.props.sortFunction || sortByName));
      });
    } else {
      if (this.props.onFilter) {
        localMatches = localMatches.filter(this.props.onFilter);
      }
      // only local matches
      callback(localMatches.sort(this.props.sortFunction || sortByName));
    }
  }

  public handleCheckValid(
    input: string,
    value: ValueType<Asset>,
    options: OptionsType<Asset>
  ): boolean {
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
        ).filter((asset: Asset) => asset.name.toLowerCase() === input.toLowerCase()).length === 0
      );
    }

    return false;
  }

  public handleCreatePrompt(input: string): any {
    return (this.props.createPrefix || `New ${this.props.name}: `) + input;
  }

  public handleGetNewOptionData(inputValue: string, label: any): Asset {
    return { id: '_', name: label, type: null };
  }

  public handleLoadingComplete(): void {
    this.setState({ isLoading: false });
  }

  public handleMenuOpen(): void {
    this.setState({
      menuOpen: true,
      message: null
    });
  }

  public handleMenuClose(): void {
    this.setState({
      menuOpen: false
    });
  }

  public handleClearMessage(): void {
    if (this.state.message) {
      this.setState({ message: null });
    }
  }

  public handleCreateOption(input: string): void {
    // this is a hack due to react-select triggering two creates in a race
    const now = new Date().getTime();
    if (now - this.lastCreation < 1000) {
      return;
    }

    this.lastCreation = now;
    // mark us as loading
    const asset: Asset = this.props.createAssetFromInput(input);

    if (this.props.assets.endpoint) {
      this.setState({ isLoading: true, message: null });
      postNewAsset(this.props.assets, asset)
        .then((result: Asset) => {
          this.setState({ isLoading: false });
          this.props.onAssetCreated(result);
          // this.props.onChange([...(this.state.entry.value as any)]);
        })
        .catch(error => {
          let suffix = '';
          if (error.response && error.response.data && error.response.data.non_field_errors) {
            suffix = ' ' + error.response.data.non_field_errors.join(', ');
          }
          this.setState({
            message: `Couldn't create new ${this.props.assets.type} "${input}".${suffix}`,
            isLoading: false
          });
        });
    } else {
      this.props.onChange([asset]);
    }
  }

  private getStyle(): any {
    if (this.state.message) {
      return messageStyle;
    }

    let style = this.props.styles || large;
    if (hasErrors(this.props.entry)) {
      const erroredControl = getErroredControl(style.control({}, {}));
      style = { ...style, ...erroredControl };
    }
    return style;
  }

  public render(): JSX.Element {
    const article = !this.props.multi ? 'an' : '';
    const newLanguage = this.props.multi ? 'new ones' : 'a new one';

    const commonAttributes = {
      className: 'react-select ' + styles.selection,
      value: this.state.entry.value,
      components: { Option: AssetOption },
      styles: this.getStyle(),
      onChange: this.handleChanged,
      onMenuOpen: this.handleMenuOpen,
      onMenuClose: this.handleMenuClose,
      onBlur: this.handleClearMessage,
      menuShouldBlockScroll: true,
      isMulti: this.props.multi,
      isDisabled: this.state.isLoading,
      isLoading: this.state.isLoading,
      isClearable: this.props.formClearable,
      isSearchable: this.props.searchable,
      getOptionValue: (option: Asset) => option.id,
      getOptionLabel: (option: Asset) => option.name,
      placeholder:
        this.props.placeholder ||
        `Select ${article} existing ${this.props.name.toLocaleLowerCase()} or enter ${newLanguage}`
    };

    if (this.props.createAssetFromInput) {
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
          helpText={this.props.helpText}
          hideError={this.state.menuOpen}
          __className={styles.ele}
        >
          <Creatable
            {...commonAttributes}
            options={localMatches.sort(this.props.sortFunction || sortByName)}
            isValidNewOption={this.handleCheckValid}
            formatCreateLabel={this.handleCreatePrompt}
            getNewOptionData={this.handleGetNewOptionData}
            onCreateOption={this.handleCreateOption}

            // We are currently using Creatable since our assets are currently
            // being preloaded on page load and because of isLoaded not being
            // honored when set manually (this is needed to perform onCreateOption
            // via call to asset endpoint with feedback). Once that fix is merged,
            // we can consider using AsyncCreateable
            //
            // See: https://github.com/JedWatson/react-select/issues/2986
            //      https://github.com/JedWatson/react-select/pull/3319
            //
          />
          {this.state.message ? <div className={styles.message}>{this.state.message}</div> : null}
        </FormElement>
      );
    } else {
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

      return (
        <FormElement
          name={this.props.name}
          entry={this.props.entry}
          showLabel={this.props.showLabel}
          helpText={this.props.helpText}
          hideError={this.state.menuOpen}
          __className={styles.ele}
        >
          <Async
            {...commonAttributes}
            defaultOptions={defaultOptions}
            cacheOptions={true}
            loadOptions={this.handleLoadOptions}
            noOptionsMessage={(obj: { inputValue: string }) =>
              this.props.noOptionsMessage || `No ${this.props.name} Found`
            }
          />
          {this.state.message ? <div className={styles.message}>{this.state.message}</div> : null}
        </FormElement>
      );
    }
  }
}
