import * as React from 'react';
import { Async, AsyncCreatable } from 'react-select';
import axios, { AxiosResponse } from 'axios';
import { SearchResult } from '../services/ComponentMap';

export interface SelectSearchProps {
    url: string;
    name: string;
    resultType: string;
    placeholder?: string;
    searchPromptText?: string | JSX.Element;
    multi?: boolean;
    closeOnSelect?: string;
    initial?: SearchResult[];
    localSearchOptions?: SearchResult[];
    className?: string;
    createPrompt?: string;
    onChange?(selection: SearchResult): void;
    isValidNewOption?(option: { label: string }): boolean;
    createNewOption?(option: { label: string; labelKey: string; valueKey: string }): any;
}

interface SelectSearchState {
    selection: SearchResult[];
}

interface SearchParams {
    term: string;
    page: number;
    _type: string;
}

interface SelectSearchResult {
    options: SearchResult[];
    complete: boolean;
}

export default class SelectSearch extends React.PureComponent<
    SelectSearchProps,
    SelectSearchState
> {
    private select: HTMLInputElement;

    constructor(props: SelectSearchProps) {
        super(props);

        this.state = {
            selection: props.initial
        };

        this.selectRef = this.selectRef.bind(this);
        this.loadOptions = this.loadOptions.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    private selectRef(ref: HTMLInputElement): HTMLInputElement {
        return (this.select = ref);
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: SearchResult[], result: SearchResult): void {
        let found = false;

        for (const existing of results) {
            if (result.id === existing.id) {
                found = true;
                break;
            }
        }

        if (!found) {
            results.push(result);
        }
    }

    private search(term: string, remoteResults: SearchResult[] = []): SelectSearchResult {
        const combined = [...remoteResults];

        if (term) {
            term = term.toLowerCase();
        }

        if (this.props.localSearchOptions) {
            for (const local of this.props.localSearchOptions) {
                if (!term || local.name.toLowerCase().indexOf(term) > -1) {
                    this.addSearchResult(combined, local);
                }
            }
        }

        const results: SelectSearchResult = {
            options: combined.sort(this.sortResults),
            complete: true
        };

        return results;
    }

    private loadOptions(input: string, callback: Function): void {
        if (!this.props.url) {
            callback(this.search(input));
        } else {
            axios.get(this.props.url).then((response: AxiosResponse) => {
                const results: SearchResult[] = [];
                response.data.results.forEach((result: any) =>
                    results.push({
                        name: result.name,
                        id: result.uuid,
                        type: this.props.resultType
                    })
                );
                callback(null, this.search(input, results));
            });
        }
    }

    private onChange(selection: any): void {
        console.log('selection', selection);

        if (!this.props.multi) {
            selection = [selection];
        }

        if (this.props.onChange) {
            this.props.onChange(selection);
        }

        this.setState({ selection }, () => this.select.focus());
    }

    private onInputChange(value: string): void {}

    private filterOption(option: SearchResult, term: string): boolean {
        return option.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
    }

    public render(): JSX.Element {
        let value: any;

        if (this.props.multi) {
            value = [];
        }

        if (this.state.selection) {
            for (const selection of this.state.selection) {
                if (selection) {
                    let selectionValue;
                    if (selection.extraResult || this.props.multi) {
                        selectionValue = selection;
                    } else {
                        selectionValue = selection.id;
                    }

                    if (this.props.multi) {
                        value = [...value, selectionValue];
                    } else {
                        value = selectionValue;
                    }
                }
            }
        }

        const options: any = {};

        if (this.props.createPrompt) {
            options.promptTextCreator = (label: string) => this.props.createPrompt + label;
        }

        if (this.props.createNewOption) {
            options.newOptionCreator = this.props.createNewOption;
        }

        if (this.props.isValidNewOption) {
            options.isValidNewOption = this.props.isValidNewOption;
        }

        if (this.props.createNewOption) {
            return (
                <AsyncCreatable
                    ref={this.selectRef}
                    className={this.props.className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    cache={false}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={this.props.multi}
                    searchable={true}
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onInputChange={this.onInputChange}
                    onChange={this.onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...options}
                />
            );
        } else {
            return (
                <Async
                    ref={this.selectRef}
                    className={this.props.className}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    loadOptions={this.loadOptions}
                    closeOnSelect={this.props.closeOnSelect}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    cache={false}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    clearable={this.props.multi}
                    searchable={true}
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onInputChange={this.onInputChange}
                    onChange={this.onChange}
                    searchPromptText={this.props.searchPromptText}
                    {...options}
                />
            );
        }
    }
}
