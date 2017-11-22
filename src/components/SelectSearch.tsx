import * as React from 'react';
import { Async as SelectAsync, AsyncCreatable as SelectAsyncCreatable } from 'react-select';
import axios, { AxiosResponse } from 'axios';
import { SearchResult } from '../services/ComponentMap';

export interface SelectSearchProps {
    url: string;
    name: string;
    resultType: string;
    placeholder?: string;
    multi?: boolean;
    clearable?: boolean;
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
    private select: any;

    constructor(props: SelectSearchProps) {
        super(props);

        this.state = {
            selection: props.initial
        };

        this.loadOptions = this.loadOptions.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: SearchResult[], result: SearchResult) {
        let found = false;

        for (let existing of results) {
            if (result.id === existing.id) {
                found = true;
                break;
            }
        }

        if (!found) {
            results.push(result);
        }
    }

    search(term: string, remoteResults: SearchResult[] = []): SelectSearchResult {
        let combined = [...remoteResults];

        if (term) {
            term = term.toLowerCase();
        }

        if (this.props.localSearchOptions) {
            for (let local of this.props.localSearchOptions) {
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

    loadOptions(input: string, callback: any) {
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

    private onChange(selection: any) {
        if (!this.props.multi) {
            selection = [selection];
        }

        if (this.props.onChange) {
            this.props.onChange(selection);
        }
        this.setState({ selection }, () => this.select.focus());
    }

    private onInputChange(value: string) {}

    private filterOption(option: SearchResult, term: string) {
        return option.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
    }

    render() {
        let value: any;

        if (this.props.multi) {
            value = [];
        }

        if (this.state.selection) {
            for (let selection of this.state.selection) {
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
                <SelectAsyncCreatable
                    className={this.props.className}
                    ref={(ele: any) => (this.select = ele)}
                    name={this.props.name}
                    loadOptions={this.loadOptions}
                    clearable={this.props.clearable}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    cache={false}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    searchable={true}
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onInputChange={this.onInputChange}
                    onChange={this.onChange}
                    {...options}
                />
            );
        } else {
            return (
                <SelectAsync
                    className={this.props.className}
                    ref={(ele: any) => (this.select = ele)}
                    name={this.props.name}
                    loadOptions={this.loadOptions}
                    clearable={this.props.clearable}
                    ignoreCase={false}
                    ignoreAccents={false}
                    value={value}
                    openOnFocus={true}
                    cache={false}
                    valueKey="id"
                    labelKey="name"
                    multi={this.props.multi}
                    searchable={true}
                    onCloseResetsInput={true}
                    onBlurResetsInput={true}
                    filterOption={this.filterOption}
                    onInputChange={this.onInputChange}
                    onChange={this.onChange}
                    {...options}
                />
            );
        }
    }
}
