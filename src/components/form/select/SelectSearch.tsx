import { react as bindCallbacks } from 'auto-bind';
import * as isEqual from 'fast-deep-equal';
import * as React from 'react';
import Select, {
    Async,
    AsyncCreatable,
    AutocompleteResult,
    IsOptionUniqueHandler,
    IsValidNewOptionHandler,
    NewOptionCreatorHandler
} from 'react-select';
import { CreateOptions } from '~/flowTypes';
import { Asset, Assets, AssetSearchResult, removeAsset } from '~/services/AssetService';

import SelectOption from '~/components/form/select/SelectOption';
import SelectValue from '~/components/form/select/SelectValue';

export interface SelectSearchProps {
    name?: string;
    actionClearable?: boolean;
    searchable?: boolean;
    placeholder?: string;
    searchPromptText?: string;
    multi?: boolean;
    closeOnSelect?: boolean;
    initial?: Asset[];
    localSearchOptions?: Asset[];
    assets?: Assets;
    __className?: string;
    createPrompt?: string;
    onChange?(selections: Asset[]): void;
    isValidNewOption?: IsValidNewOptionHandler;
    isOptionUnique?: IsOptionUniqueHandler;
    createNewOption?: NewOptionCreatorHandler;
}

interface SelectSearchState {
    selections: Asset[];
}

export default class SelectSearch extends React.Component<SelectSearchProps, SelectSearchState> {
    private select: any;

    constructor(props: SelectSearchProps) {
        super(props);

        this.state = {
            selections: props.initial || []
        };

        bindCallbacks(this, {
            include: ['selectRef', 'loadOptions', /^on/]
        });
    }

    public selectRef(ref: any): any {
        return (this.select = ref);
    }

    public componentWillReceiveProps(nextProps: SelectSearchProps): void {
        if (!isEqual(this.props.initial, nextProps.initial)) {
            this.setState({ selections: nextProps.initial });
        }
    }

    public onChange(selection: Asset): void {
        this.onChangeMulti([selection]);
    }

    public onChangeMulti(selections: Asset[]): void {
        if (this.props.assets) {
            for (const selection of selections) {
                if (selection.isNew) {
                    this.props.assets.add(selection);
                }
            }
        }

        if (!isEqual(this.state.selections, selections)) {
            if (this.props.onChange) {
                this.props.onChange(selections);
            }

            this.setState(
                {
                    selections
                },
                () => this.select.focus()
            );
        }
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: Asset, b: Asset): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: Asset[], result: Asset): Asset[] {
        const newResults = [...results];

        let found = false;
        for (const existing of newResults) {
            if (result.id === existing.id) {
                found = true;
                break;
            }
        }

        if (!found) {
            newResults.push(result);
        }

        return newResults;
    }

    public search(term: string): Promise<AutocompleteResult> {
        let combined: Asset[] = [];
        if (this.props.localSearchOptions) {
            for (const local of this.props.localSearchOptions) {
                if (
                    !term ||
                    (local.name && local.name.toLowerCase().indexOf(term.toLowerCase()) > -1)
                ) {
                    combined = this.addSearchResult(combined, local);
                }
            }
        }

        // if we have assets, check there
        if (this.props.assets) {
            return this.props.assets.search(term).then((assetResults: AssetSearchResult) => {
                for (const result of assetResults.assets) {
                    combined = this.addSearchResult(combined, result);
                }

                const options = assetResults.sorted ? combined : combined.sort(this.sortResults);
                return new Promise<AutocompleteResult>(resolve => {
                    resolve({
                        complete: assetResults.complete,
                        options: this.props.actionClearable ? [removeAsset, ...options] : options
                    });
                });
            });
        }

        return new Promise<AutocompleteResult>(resolve => {
            const sorted = combined.sort(this.sortResults);
            resolve({
                options: this.props.actionClearable ? [removeAsset, ...sorted] : sorted,
                complete: true
            });
        });
    }

    public loadOptions(
        input: string,
        callback: (err: any, result: AutocompleteResult) => void
    ): void {
        this.search(input).then((result: AutocompleteResult) => callback(null, result));
    }

    private filterOption(option: Asset, term: string): boolean {
        return option.name && option.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
    }

    public render(): JSX.Element {
        let value: any;

        if (this.props.multi) {
            value = [];
        }

        if (this.state.selections.length) {
            for (const selection of this.state.selections) {
                if (selection) {
                    const selectionValue: string | Asset =
                        selection.isNew || this.props.multi ? selection : selection.id;

                    if (this.props.multi) {
                        value.push(selectionValue);
                    } else {
                        value = selectionValue;
                    }
                }
            }
        }

        // Value will be removeAsset if an initial value hasn't
        // been passed and the actionClearable prop is truthy.
        if (this.props.actionClearable && (!value || !value.length)) {
            value = Array.isArray(value) ? [removeAsset] : removeAsset;
        }

        const onChange = this.props.multi ? this.onChangeMulti : this.onChange;

        const createOptions: CreateOptions = {};
        if (this.props.createPrompt) {
            createOptions.promptTextCreator = (label: string) => this.props.createPrompt + label;
        }
        if (this.props.createNewOption) {
            createOptions.newOptionCreator = this.props.createNewOption;
        }
        if (this.props.isValidNewOption) {
            createOptions.isValidNewOption = this.props.isValidNewOption;
        }

        if (this.props.isOptionUnique) {
            createOptions.isOptionUnique = this.props.isOptionUnique;
        }

        if (this.props.createNewOption) {
            return (
                <AsyncCreatable
                    ref={this.selectRef}
                    joinValues={true}
                    className={this.props.__className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={false}
                    searchable={this.props.searchable}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={onChange}
                    optionComponent={SelectOption}
                    valueComponent={SelectValue}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            );
        } else {
            return (
                <Async
                    ref={this.selectRef}
                    joinValues={true}
                    className={this.props.__className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={false}
                    searchable={this.props.searchable}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onChange={onChange}
                    optionComponent={SelectOption}
                    valueComponent={SelectValue}
                    searchPromptText={this.props.searchPromptText}
                    {...createOptions}
                />
            );
        }
    }
}
