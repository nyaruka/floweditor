import * as React from 'react';
import * as UUID from 'uuid';

import axios from 'axios';
import { AxiosResponse } from 'axios';
import { SearchResult } from './ComponentMap';

var Select = require('react-select');

interface SelectSearchProps {
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
    createNewOption?(option: { label: string, labelKey: string, valueKey: string }): any;
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

export class SelectSearch extends React.PureComponent<SelectSearchProps, SelectSearchState> {

    private select: any;

    constructor(props: SelectSearchProps) {
        super(props);
        this.state = {
            selection: props.initial
        }
    }

    /**
     * Sorts all search results by name
     */
    private sortResults(a: SearchResult, b: SearchResult): number {
        return a.name.localeCompare(b.name);
    }

    private addSearchResult(results: SearchResult[], result: SearchResult) {
        var found = false;
        for (let existing of results) {
            if (result.id == existing.id) {
                found = true;
                break;
            }
        }

        if (!found) {
            results.push(result);
        }
    }

    search(term: string, remoteResults: SearchResult[] = []): SelectSearchResult {

        var combined = remoteResults.concat([]);

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

        combined.sort(this.sortResults);
        var results: SelectSearchResult = {
            options: combined,
            complete: true
        };

        return results;
    }

    loadOptions(input: string, callback: any) {
        if (this.props.url == null) {
            callback(this.search(input));
        } else {
            axios.get(this.props.url).then((response: AxiosResponse) => {
                var results: SearchResult[] = [];
                for (let result of response.data.results) {
                    results.push({
                        name: result["name"],
                        id: result["uuid"],
                        type: this.props.resultType,
                    });
                }
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
        this.setState({ selection: selection });
        this.select.focus();

    };

    private onInputChange(value: string) {
    }

    private filterOption(option: SearchResult, term: string) {
        return (option.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
    }

    render() {
        var value: any;

        if (this.props.multi) {
            value = [];
        }

        if (this.state.selection) {
            for (let selection of this.state.selection) {
                if (selection) {
                    var selectionValue;
                    if (selection.extraResult || this.props.multi) {
                        selectionValue = selection;
                    } else {
                        selectionValue = selection.id;
                    }

                    if (this.props.multi) {
                        value.push(selectionValue);
                    } else {
                        value = selectionValue;
                    }
                }
            }
        }

        var options: any = {};
        if (this.props.createPrompt) {
            options['promptTextCreator'] = (label: string) => {
                return this.props.createPrompt + label
            }
        }

        if (this.props.createNewOption) {
            options['newOptionCreator'] = this.props.createNewOption;
        }

        if (this.props.isValidNewOption) {
            options['isValidNewOption'] = this.props.isValidNewOption;
        }

        if (this.props.createNewOption) {
            return (
                <Select.AsyncCreatable
                    className={this.props.className}
                    ref={(ele: any) => { this.select = ele }}
                    name={this.props.name}
                    loadOptions={this.loadOptions.bind(this)}
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
                    onInputChange={this.onInputChange.bind(this)}
                    onChange={this.onChange.bind(this)}
                    {...options}
                />
            );
        } else {
            return (
                <Select.Async
                    className={this.props.className}
                    ref={(ele: any) => { this.select = ele }}
                    name={this.props.name}
                    loadOptions={this.loadOptions.bind(this)}
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
                    onInputChange={this.onInputChange.bind(this)}
                    onChange={this.onChange.bind(this)}
                    {...options}
                />
            );
        }
    }
}