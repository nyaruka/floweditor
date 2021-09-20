import { react as bindCallbacks } from 'auto-bind';
import FormElement, { FormElementProps } from 'components/form/FormElement';
import { postNewAsset, searchAssetMap } from 'external';
import * as React from 'react';
import { Asset, Assets, AssetType, REMOVE_VALUE_ASSET } from 'store/flowContext';
import { AssetEntry } from 'store/nodeEditor';

import styles from './AssetSelector.module.scss';
import i18n from 'config/i18n';
import TembaSelect, { TembaSelectStyle } from 'temba/TembaSelect';
import { sortByName } from './helpers';

export interface AssetSelectorProps extends FormElementProps {
  assets?: Assets;
  onChange: (selected: Asset[]) => void;

  // a function to exclude assets when matching
  shouldExclude?: (asset: Asset) => boolean;

  // override how a name is determined
  getName?: (option: any) => string;

  // should options not in the list be allowed
  allowArbitrary?: boolean;

  // allow expression entry
  expressions?: boolean;

  // more options to consider when searching
  additionalOptions?: any[];

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

  style?: TembaSelectStyle;

  // override default sorting function
  sortFunction?(a: any, b: any): number;

  nameKey?: string;
  valueKey?: string;
}

interface AssetSelectorState {
  defaultOptions: Asset[];
  entry: AssetEntry;
  isLoading: boolean;
  message?: string;
}

export default class AssetSelector extends React.Component<AssetSelectorProps, AssetSelectorState> {
  private lastCreation: number = 0;

  private options: any[] = [];

  constructor(props: AssetSelectorProps) {
    super(props);
    bindCallbacks(this, {
      include: [/^is/, /^handle/, /^get/]
    });

    let defaultOptions: Asset[] = [];

    // or it should be a list of local assets from an empty search
    if (props.assets && !props.assets.endpoint) {
      defaultOptions = searchAssetMap('', props.assets.items);
    }

    this.options = this.props.additionalOptions || [];
    if (this.props.valueClearable) {
      this.options.push(REMOVE_VALUE_ASSET);
    }

    // if we don't have an endpoint, populate our options with items
    if (this.props.assets && !this.props.assets.endpoint) {
      this.options = this.options.concat(
        Object.keys(this.props.assets.items).map((id: string) => this.props.assets.items[id])
      );
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
      const existing = prevState.defaultOptions.find((asset: Asset) => asset.id === entry.value.id);
      if (existing) {
        entry = { value: existing };
      }
    }

    return { entry };
  }

  private handleChanged(selected: any): void {
    if (selected) {
      selected = Array.isArray(selected) ? selected : [selected];

      // do we have an asset to create
      const toCreate = selected.find((option: any) => option.arbitrary);
      if (toCreate) {
        // filter it out
        selected = selected.filter((option: any) => !option.arbitrary);
        this.handleCreateOption(toCreate.name);
      } else {
        this.props.onChange(selected);
      }
    } else {
      this.props.onChange(selected);
    }
    this.setState({ message: null });
  }

  public handleLoadingComplete(): void {
    this.setState({ isLoading: false });
  }

  public handleClearMessage(): void {
    if (this.state.message) {
      this.setState({ message: null });
    }
  }

  public handleCreateArbitraryOption(input: string): any {
    return { prefix: this.props.createPrefix, name: input, id: 'created' };
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

    if (this.props.assets && this.props.assets.endpoint) {
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

  public getName(option: any) {
    if (this.props.getName) {
      return this.props.getName(option);
    }
  }

  public render(): JSX.Element {
    const fallbackPlaceholder = i18n.t(
      'asset_selector.placeholder',
      'Select existing [[name]] or enter a new one',
      { name: this.props.name.toLocaleLowerCase(), count: this.props.multi ? 1000 : 1 }
    );

    return (
      <FormElement
        name={this.props.name}
        entry={this.props.entry}
        showLabel={this.props.showLabel}
        helpText={this.props.helpText}
        __className={styles.ele}
      >
        <TembaSelect
          name={this.props.name}
          style={this.props.style}
          onChange={this.handleChanged}
          nameKey={this.props.nameKey || 'name'}
          createArbitraryOption={this.handleCreateArbitraryOption}
          valueKey={
            this.props.valueKey || (this.props.assets ? this.props.assets.id : undefined) || 'uuid'
          }
          getName={this.props.getName}
          createPrefix={this.props.createPrefix}
          shouldExclude={this.props.shouldExclude}
          assets={this.props.assets}
          placeholder={this.props.placeholder || fallbackPlaceholder}
          multi={this.props.multi}
          expressions={this.props.expressions}
          value={this.state.entry.value}
          errors={this.state.message ? [this.state.message] : []}
          searchable={this.props.searchable}
          cacheKey={this.lastCreation + ''}
          options={this.options}
          sortFunction={this.props.sortFunction || sortByName}
          queryParam={
            this.props.assets && this.props.assets.type === AssetType.Contact ? 'search' : null
          }
        />
      </FormElement>
    );
  }
}
